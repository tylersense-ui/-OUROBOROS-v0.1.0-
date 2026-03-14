/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║              🐍 OUROBOROS v0.2.0 🐍                       ║
 * ║    Simple Batcher - Le Serpent Frappe en Parallèle       ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /core/simple-batcher.js
 * @version     0.2.0
 * @author      Claude (Godlike AI Operator)
 * @description Orchestrateur HWGW simple (1 batch à la fois)
 * 
 * USAGE:
 *   run /core/simple-batcher.js
 *   run /core/simple-batcher.js --debug 2
 *   run /core/simple-batcher.js --target foodnstuff
 * 
 * FEATURES:
 *   🎯 HWGW batching (Hack-Weaken-Grow-Weaken)
 *   🔄 Prep automatique via PrepModule
 *   💰 Revenue RÉEL (enfin !)
 *   ⚡ Timing précis (200ms spacing)
 *   📊 Monitoring performance
 * 
 * STRATÉGIE:
 *   1. Prep serveur (min sec / max money)
 *   2. Lancer 1 batch HWGW avec timing précis
 *   3. Attendre que batch finisse
 *   4. Re-prep si besoin
 *   5. Repeat
 * 
 * ARGUMENTS:
 *   --debug <N> : Debug level 0-3 (optionnel)
 *   --target <hostname> : Target serveur (optionnel, auto si absent)
 * 
 * CHANGELOG:
 *   v0.2.0 - 2025-01-XX - Création initiale
 *          - HWGW batching basique
 *          - Integration PrepModule
 *          - Approximations sans Formulas.exe
 *          - Revenue tracking temps réel
 */

import { PrepModule } from "/lib/prep-module.js";
import { StateManager } from "/lib/state-manager.js";
import { Debug, parseDebugLevel, ICONS } from "/lib/debug.js";

// ══════════════════════════════════════════════════════════════
// CONFIGURATION
// ══════════════════════════════════════════════════════════════

const UPDATE_INTERVAL = 1000; // 1s entre checks
const BATCH_SPACING = 200; // ms entre H/W/G/W finishes

const WORKER_SCRIPTS = {
    hack: "/workers/hack.js",
    grow: "/workers/grow.js",
    weaken: "/workers/weaken.js"
};

const RAM_COSTS = {
    hack: 1.70,
    grow: 1.75,
    weaken: 1.75
};

// Hack percent cible (conservateur pour début)
const TARGET_HACK_PERCENT = 0.05; // 5%

// Recovery padding (10x sécurité)
const RECOVERY_PADDING = 10;

// ══════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════

/** @param {NS} ns */
export async function main(ns) {
    // Setup
    ns.disableLog("ALL");
    ns.ui.openTail();
    
    const debugLevel = parseDebugLevel(ns);
    const dbg = new Debug(ns, debugLevel);
    const stateMgr = new StateManager(ns, debugLevel);
    const prep = new PrepModule(ns, debugLevel);
    
    dbg.header("SIMPLE BATCHER v0.2.0");
    dbg.normal("Le Serpent frappe enfin en parallèle !", ICONS.SNAKE);
    dbg.separator();
    
    // Parse target argument
    const targetArg = ns.args.find(arg => arg !== "--debug" && !String(arg).match(/^\d+$/));
    
    let cycle = 0;
    let lastMoney = ns.getServerMoneyAvailable("home");
    let totalRevenue = 0;
    
    // ══════════════════════════════════════════════════════════════
    // MAIN LOOP
    // ══════════════════════════════════════════════════════════════
    
    while (true) {
        cycle++;
        const timestamp = new Date().toISOString();
        
        dbg.clear();
        dbg.header(`SIMPLE BATCHER - Cycle ${cycle}`);
        dbg.normal(`${ICONS.TIMER} ${new Date().toLocaleTimeString()}`);
        dbg.separator();
        
        // ══════════════════════════════════════════════════════════════
        // PHASE 1 : NETWORK SCAN
        // ══════════════════════════════════════════════════════════════
        
        const allServers = scanNetwork(ns);
        dbg.verbose(`${ICONS.NETWORK} Scanned ${allServers.length} servers`);
        
        // Auto-root
        const rootedCount = autoRoot(ns, dbg, allServers);
        if (rootedCount > 0) {
            dbg.success(`Rooted ${rootedCount} new server(s)`);
        }
        
        const rootedServers = allServers.filter(host => ns.hasRootAccess(host));
        dbg.normal(`${ICONS.SUCCESS} Rooted: ${rootedServers.length} servers`);
        
        // ══════════════════════════════════════════════════════════════
        // PHASE 2 : TARGET SELECTION
        // ══════════════════════════════════════════════════════════════
        
        let target;
        
        if (targetArg) {
            target = targetArg;
            dbg.verbose(`${ICONS.TARGET} Using manual target: ${target}`);
        } else {
            target = selectBestTarget(ns, dbg, allServers);
        }
        
        if (!target) {
            dbg.warn("No valid target found");
            await ns.sleep(UPDATE_INTERVAL);
            continue;
        }
        
        dbg.normal(`${ICONS.TARGET} Target: ${target}`);
        
        // ══════════════════════════════════════════════════════════════
        // PHASE 3 : PREP SERVER (si nécessaire)
        // ══════════════════════════════════════════════════════════════
        
        if (!prep.isServerReady(target)) {
            dbg.normal(`${ICONS.ROCKET} Server needs prep...`);
            
            const prepSuccess = await prep.prepareServer(target, rootedServers);
            
            if (!prepSuccess) {
                dbg.warn("Prep failed, retrying next cycle");
                await ns.sleep(UPDATE_INTERVAL);
                continue;
            }
        } else {
            dbg.verbose(`${ICONS.SUCCESS} Server already prepped`);
        }
        
        // ══════════════════════════════════════════════════════════════
        // PHASE 4 : HWGW BATCH
        // ══════════════════════════════════════════════════════════════
        
        dbg.normal(`${ICONS.FIRE} Launching HWGW batch...`);
        
        const batchResult = await runHWGWBatch(ns, dbg, target, rootedServers);
        
        if (!batchResult.success) {
            dbg.warn("Batch failed, retrying");
            await ns.sleep(UPDATE_INTERVAL);
            continue;
        }
        
        dbg.success(`Batch completed!`);
        dbg.normal(`${ICONS.CHART} Threads: H${batchResult.threads.hack} W${batchResult.threads.weaken1} G${batchResult.threads.grow} W${batchResult.threads.weaken2}`);
        
        // ══════════════════════════════════════════════════════════════
        // PHASE 5 : STATS & REVENUE TRACKING
        // ══════════════════════════════════════════════════════════════
        
        const currentMoney = ns.getServerMoneyAvailable("home");
        const hackingLevel = ns.getHackingLevel();
        const moneyGain = currentMoney - lastMoney;
        
        if (moneyGain > 0) {
            totalRevenue += moneyGain;
            
            const batchDuration = batchResult.duration / 1000;
            const revenuePerSecond = moneyGain / batchDuration;
            
            dbg.separator();
            dbg.money("Money", currentMoney);
            dbg.success(`Gain this batch: +$${ns.formatNumber(moneyGain)}`);
            dbg.normal(`${ICONS.SPEED} Revenue: ~$${ns.formatNumber(revenuePerSecond)}/s`);
            dbg.normal(`${ICONS.CHART} Total earned: $${ns.formatNumber(totalRevenue)}`);
            
            // Toast si gros gain
            if (moneyGain > 10000) {
                dbg.toastSuccess(`+$${ns.formatNumber(moneyGain)} earned!`);
            }
        }
        
        dbg.normal(`${ICONS.TARGET} Hacking: ${hackingLevel}`);
        
        // ══════════════════════════════════════════════════════════════
        // PHASE 6 : SAVE STATE
        // ══════════════════════════════════════════════════════════════
        
        await stateMgr.save("batcher-status.json", {
            timestamp: timestamp,
            cycle: cycle,
            target: target,
            batchCompleted: true,
            threadsUsed: batchResult.threads,
            moneyGain: moneyGain,
            totalRevenue: totalRevenue,
            hackingLevel: hackingLevel,
            serverReady: prep.isServerReady(target)
        });
        
        dbg.separator();
        dbg.normal(`${ICONS.TIMER} Next batch in ${UPDATE_INTERVAL / 1000}s...`);
        
        lastMoney = currentMoney;
        await ns.sleep(UPDATE_INTERVAL);
    }
}

// ══════════════════════════════════════════════════════════════
// HWGW BATCH FUNCTION
// ══════════════════════════════════════════════════════════════

/**
 * Lancer une batch HWGW complète
 * @param {NS} ns
 * @param {Debug} dbg
 * @param {string} target
 * @param {Array<string>} hosts
 * @returns {Promise<object>}
 */
async function runHWGWBatch(ns, dbg, target, hosts) {
    const startTime = Date.now();
    
    // Calculer threads HWGW
    const batchThreads = calculateHWGWThreads(ns, target);
    
    dbg.verbose(`${ICONS.CHART} Batch threads:`);
    dbg.verbose(`  Hack: ${batchThreads.hack}`);
    dbg.verbose(`  Weaken1: ${batchThreads.weaken1}`);
    dbg.verbose(`  Grow: ${batchThreads.grow}`);
    dbg.verbose(`  Weaken2: ${batchThreads.weaken2}`);
    
    // Vérifier RAM disponible
    const totalRAMNeeded = 
        (batchThreads.hack * RAM_COSTS.hack) +
        (batchThreads.weaken1 * RAM_COSTS.weaken) +
        (batchThreads.grow * RAM_COSTS.grow) +
        (batchThreads.weaken2 * RAM_COSTS.weaken);
    
    const availableRAM = calculateAvailableRAM(ns, hosts);
    
    dbg.verbose(`${ICONS.CHART} RAM: ${ns.formatRam(availableRAM)} / ${ns.formatRam(totalRAMNeeded)} needed`);
    
    if (availableRAM < totalRAMNeeded) {
        dbg.warn(`Insufficient RAM for batch`);
        return { success: false };
    }
    
    // Calculer timing HWGW
    const timings = calculateHWGWTimings(ns, target);
    
    dbg.verbose(`${ICONS.TIMER} Timings:`);
    dbg.verbose(`  Hack: +${(timings.hackDelay / 1000).toFixed(1)}s delay`);
    dbg.verbose(`  Weaken1: no delay`);
    dbg.verbose(`  Grow: +${(timings.growDelay / 1000).toFixed(1)}s delay`);
    dbg.verbose(`  Weaken2: +${(timings.weaken2Delay / 1000).toFixed(1)}s delay`);
    
    // Copier scripts
    for (const host of hosts) {
        for (const script of Object.values(WORKER_SCRIPTS)) {
            await ns.scp(script, host);
        }
    }
    
    // Déployer HWGW
    const jobs = [
        { script: WORKER_SCRIPTS.hack, threads: batchThreads.hack, delay: timings.hackDelay, type: "H" },
        { script: WORKER_SCRIPTS.weaken, threads: batchThreads.weaken1, delay: 0, type: "W1" },
        { script: WORKER_SCRIPTS.grow, threads: batchThreads.grow, delay: timings.growDelay, type: "G" },
        { script: WORKER_SCRIPTS.weaken, threads: batchThreads.weaken2, delay: timings.weaken2Delay, type: "W2" }
    ];
    
    let deployedAll = true;
    
    for (const job of jobs) {
        const deployed = deployJob(ns, dbg, job, target, hosts);
        if (deployed === 0) {
            dbg.warn(`Failed to deploy ${job.type}`);
            deployedAll = false;
        }
    }
    
    if (!deployedAll) {
        return { success: false };
    }
    
    // Attendre que batch finisse
    const weakenTime = ns.getWeakenTime(target);
    const batchDuration = weakenTime + 2000; // +2s marge
    
    dbg.normal(`${ICONS.TIMER} Batch running (${(batchDuration / 1000).toFixed(1)}s)...`);
    
    await ns.sleep(batchDuration);
    
    const endTime = Date.now();
    
    return {
        success: true,
        threads: batchThreads,
        duration: endTime - startTime
    };
}

/**
 * Calculer threads HWGW nécessaires
 * @param {NS} ns
 * @param {string} target
 * @returns {object}
 */
function calculateHWGWThreads(ns, target) {
    const maxMoney = ns.getServerMaxMoney(target);
    
    // === HACK THREADS ===
    
    // Approximation sans Formulas.exe
    const hackAnalyze = ns.hackAnalyze(target); // % volé par 1 thread
    let hackThreads = Math.floor(TARGET_HACK_PERCENT / hackAnalyze);
    hackThreads = Math.max(1, hackThreads);
    
    // === GROW THREADS ===
    
    // Argent après hack
    const moneyAfterHack = maxMoney * (1 - TARGET_HACK_PERCENT);
    
    // Multiplier pour revenir à max
    const growthNeeded = maxMoney / moneyAfterHack;
    
    let growThreads;
    try {
        growThreads = Math.ceil(ns.growthAnalyze(target, growthNeeded));
    } catch (error) {
        growThreads = Math.ceil(growthNeeded * 100); // Fallback
    }
    
    // === WEAKEN THREADS ===
    
    const hackSecurityImpact = hackThreads * 0.002; // 1 hack = +0.002 sec
    const growSecurityImpact = growThreads * 0.004; // 1 grow = +0.004 sec
    
    const weakenEffect = 0.05; // 1 weaken = -0.05 sec
    
    let weaken1Threads = Math.ceil(hackSecurityImpact / weakenEffect);
    let weaken2Threads = Math.ceil(growSecurityImpact / weakenEffect);
    
    // === RECOVERY PADDING ===
    
    weaken1Threads = Math.ceil(weaken1Threads * RECOVERY_PADDING);
    growThreads = Math.ceil(growThreads * RECOVERY_PADDING);
    weaken2Threads = Math.ceil(weaken2Threads * RECOVERY_PADDING);
    
    // Minimum 1
    weaken1Threads = Math.max(1, weaken1Threads);
    weaken2Threads = Math.max(1, weaken2Threads);
    
    return {
        hack: hackThreads,
        weaken1: weaken1Threads,
        grow: growThreads,
        weaken2: weaken2Threads
    };
}

/**
 * Calculer timings HWGW
 * @param {NS} ns
 * @param {string} target
 * @returns {object}
 */
function calculateHWGWTimings(ns, target) {
    const weakenTime = ns.getWeakenTime(target);
    const growTime = ns.getGrowTime(target);
    const hackTime = ns.getHackTime(target);
    
    // Tous doivent finir dans l'ordre avec BATCH_SPACING ms d'écart
    // Ordre de finish: H → W1 → G → W2
    
    const hackDelay = weakenTime - hackTime - 3 * BATCH_SPACING;
    const weaken1Delay = 0; // Weaken finit en premier des 4
    const growDelay = weakenTime - growTime - BATCH_SPACING;
    const weaken2Delay = BATCH_SPACING;
    
    return {
        hackDelay: Math.max(0, hackDelay),
        weaken1Delay: weaken1Delay,
        growDelay: Math.max(0, growDelay),
        weaken2Delay: weaken2Delay
    };
}

/**
 * Déployer un job
 * @param {NS} ns
 * @param {Debug} dbg
 * @param {object} job
 * @param {string} target
 * @param {Array<string>} hosts
 * @returns {number} Threads déployés
 */
function deployJob(ns, dbg, job, target, hosts) {
    let remainingThreads = job.threads;
    let totalDeployed = 0;
    
    const ramCost = job.script.includes("hack") ? RAM_COSTS.hack :
                    job.script.includes("grow") ? RAM_COSTS.grow : RAM_COSTS.weaken;
    
    for (const host of hosts) {
        if (remainingThreads <= 0) break;
        
        const maxRam = ns.getServerMaxRam(host);
        const usedRam = ns.getServerUsedRam(host);
        const availableRam = maxRam - usedRam;
        
        if (availableRam < ramCost) continue;
        
        const possibleThreads = Math.floor(availableRam / ramCost);
        const threadsToUse = Math.min(possibleThreads, remainingThreads);
        
        if (threadsToUse === 0) continue;
        
        // Lancer avec delay
        setTimeout(() => {
            ns.exec(job.script, host, threadsToUse, target);
        }, job.delay);
        
        totalDeployed += threadsToUse;
        remainingThreads -= threadsToUse;
        
        dbg.ultra(`  ${job.type} ${host}: ${threadsToUse}t`);
    }
    
    return totalDeployed;
}

// ══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS (réutilisées de early-creeper)
// ══════════════════════════════════════════════════════════════

function scanNetwork(ns) {
    const visited = new Set();
    const queue = ["home"];
    const servers = [];
    
    while (queue.length > 0) {
        const current = queue.shift();
        if (visited.has(current)) continue;
        visited.add(current);
        
        const neighbors = ns.scan(current);
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                queue.push(neighbor);
            }
        }
        
        servers.push(current);
    }
    
    return servers;
}

function autoRoot(ns, dbg, servers) {
    let rootedCount = 0;
    
    for (const host of servers) {
        if (ns.hasRootAccess(host)) continue;
        
        const reqHackLevel = ns.getServerRequiredHackingLevel(host);
        const myHackLevel = ns.getHackingLevel(host);
        
        if (myHackLevel < reqHackLevel) continue;
        
        const reqPorts = ns.getServerNumPortsRequired(host);
        let openedPorts = 0;
        
        if (ns.fileExists("BruteSSH.exe", "home")) { ns.brutessh(host); openedPorts++; }
        if (ns.fileExists("FTPCrack.exe", "home")) { ns.ftpcrack(host); openedPorts++; }
        if (ns.fileExists("relaySMTP.exe", "home")) { ns.relaysmtp(host); openedPorts++; }
        if (ns.fileExists("HTTPWorm.exe", "home")) { ns.httpworm(host); openedPorts++; }
        if (ns.fileExists("SQLInject.exe", "home")) { ns.sqlinject(host); openedPorts++; }
        
        if (openedPorts >= reqPorts) {
            try {
                ns.nuke(host);
                rootedCount++;
                dbg.ultra(`${ICONS.SUCCESS} Rooted: ${host}`);
            } catch (error) {
                // Ignore
            }
        }
    }
    
    return rootedCount;
}

function selectBestTarget(ns, dbg, servers) {
    const myHackLevel = ns.getHackingLevel();
    
    const validTargets = servers.filter(host => {
        if (ns.getServerMaxMoney(host) === 0) return false;
        if (ns.getServerRequiredHackingLevel(host) > myHackLevel) return false;
        if (host === "home") return false;
        return true;
    });
    
    if (validTargets.length === 0) return null;
    
    const scored = validTargets.map(host => {
        const maxMoney = ns.getServerMaxMoney(host);
        const minSec = ns.getServerMinSecurityLevel(host);
        const reqHack = ns.getServerRequiredHackingLevel(host);
        const hackChance = ns.hackAnalyzeChance(host);
        
        const score = (maxMoney * hackChance) / (minSec * Math.max(1, reqHack));
        
        return { host, score };
    });
    
    scored.sort((a, b) => b.score - a.score);
    
    return scored[0].host;
}

function calculateAvailableRAM(ns, hosts) {
    let total = 0;
    
    for (const host of hosts) {
        const maxRam = ns.getServerMaxRam(host);
        const usedRam = ns.getServerUsedRam(host);
        total += (maxRam - usedRam);
    }
    
    return total;
}
