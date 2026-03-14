/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║              🐍 OUROBOROS v0.2.1 🐍                       ║
 * ║   Improved Creeper - Le Serpent Qui Frappe               ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /core/improved-creeper.js
 * @version     0.2.1
 * @author      Claude (Neo après formation Kung Fu)
 * @description Orchestrateur avec déploiement parallèle massif
 * 
 * USAGE:
 *   run /core/improved-creeper.js
 *   run /core/improved-creeper.js --debug 2
 * 
 * RÉVOLUTION vs early-creeper:
 *   ❌ early-creeper : 1 thread séquentiel
 *   ✅ improved-creeper : 100+ threads parallèles sur 17 hosts
 * 
 * STRATÉGIE:
 *   1. Scan TOUTE la RAM réseau (370GB+)
 *   2. Calculer threads disponibles par host
 *   3. Deploy MASSIVEMENT selon état target:
 *      - Needs weaken → FLOOD weaken
 *      - Needs grow → 70% grow + 30% weaken
 *      - Ready hack → 20% hack + 60% grow + 20% weaken
 *   4. Refresh 5s (pas 30s)
 *   5. Validation RAM STRICTE
 * 
 * ARGUMENTS:
 *   --debug <N> : Debug level 0-3 (optionnel)
 * 
 * KUNG FU LESSONS APPLIED:
 *   ✅ grow() exponentiel compris
 *   ✅ Validation RAM stricte
 *   ✅ Pas de padding délirant
 *   ✅ Ratios dynamiques selon état
 *   ✅ Parallel > Sequential
 * 
 * CHANGELOG:
 *   v0.2.1 - 2025-03-14 - RÉVOLUTION : Parallel deployment massif
 *          - Deploy sur TOUS les hosts simultanément
 *          - Ratios dynamiques selon état target
 *          - Validation RAM stricte (no more 42TB)
 *          - Refresh 5s au lieu de 30s
 *          - Revenue attendu: $0/s → $2k-8k/s
 */

import { StateManager } from "/lib/state-manager.js";
import { Debug, parseDebugLevel, ICONS } from "/lib/debug.js";

// ══════════════════════════════════════════════════════════════
// CONFIGURATION
// ══════════════════════════════════════════════════════════════

const UPDATE_INTERVAL = 5000; // 5s refresh (rapide)
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

// Seuils intelligents (pas de padding délirant)
const SECURITY_THRESHOLD = 5;
const MONEY_THRESHOLD = 0.75;

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
    
    dbg.header("IMPROVED CREEPER v0.2.1");
    dbg.normal("Le Serpent frappe avec 100+ threads parallèles...", ICONS.FIRE);
    dbg.separator();
    
    let cycle = 0;
    let lastMoney = ns.getServerMoneyAvailable("home");
    
    // ══════════════════════════════════════════════════════════════
    // MAIN LOOP
    // ══════════════════════════════════════════════════════════════
    
    while (true) {
        cycle++;
        const timestamp = new Date().toISOString();
        
        dbg.clear();
        dbg.header(`IMPROVED CREEPER - Cycle ${cycle}`);
        dbg.normal(`${ICONS.TIMER} ${new Date().toLocaleTimeString()}`);
        dbg.separator();
        
        // ══════════════════════════════════════════════════════════════
        // PHASE 1 : SCAN & ROOT
        // ══════════════════════════════════════════════════════════════
        
        dbg.verbose(`${ICONS.NETWORK} Scanning network...`);
        const allServers = scanNetwork(ns);
        const rootedCount = autoRoot(ns, dbg, allServers);
        
        if (rootedCount > 0) {
            dbg.success(`Rooted ${rootedCount} new server(s)`);
            dbg.toastSuccess(`${rootedCount} server(s) rooted!`);
        }
        
        const rootedServers = allServers.filter(host => ns.hasRootAccess(host));
        dbg.normal(`${ICONS.SUCCESS} Rooted: ${rootedServers.length} servers`);
        
        // ══════════════════════════════════════════════════════════════
        // PHASE 2 : CALCULER RAM TOTALE
        // ══════════════════════════════════════════════════════════════
        
        const ramAnalysis = analyzeNetworkRAM(ns, rootedServers);
        
        dbg.normal(`${ICONS.CHART} Total RAM: ${ns.formatRam(ramAnalysis.totalMax)}`);
        dbg.normal(`${ICONS.CHART} Available: ${ns.formatRam(ramAnalysis.totalAvailable)}`);
        dbg.verbose(`${ICONS.CHART} Usage: ${ramAnalysis.usagePercent.toFixed(1)}%`);
        
        // ══════════════════════════════════════════════════════════════
        // PHASE 3 : SELECT TARGET
        // ══════════════════════════════════════════════════════════════
        
        const target = selectBestTarget(ns, dbg, allServers);
        
        if (!target) {
            dbg.warn("No valid target found");
            await ns.sleep(UPDATE_INTERVAL);
            continue;
        }
        
        dbg.normal(`${ICONS.TARGET} Target: ${target}`);
        
        const targetInfo = getTargetInfo(ns, target);
        dbg.normal(`  💰 Money: ${targetInfo.moneyPercent.toFixed(1)}% ($${ns.formatNumber(targetInfo.currentMoney)}/$${ns.formatNumber(targetInfo.maxMoney)})`);
        dbg.normal(`  🔒 Security: Δ${targetInfo.securityDelta.toFixed(2)} (${targetInfo.currentSecurity.toFixed(2)}/${targetInfo.minSecurity.toFixed(2)})`);
        
        // ══════════════════════════════════════════════════════════════
        // PHASE 4 : DÉCIDER STRATÉGIE
        // ══════════════════════════════════════════════════════════════
        
        const strategy = decideStrategy(ns, targetInfo);
        dbg.normal(`${ICONS.BRAIN} Strategy: ${strategy.mode.toUpperCase()}`);
        dbg.verbose(`  📝 ${strategy.reason}`);
        dbg.verbose(`  📊 Ratios: H:${strategy.ratios.hack}% G:${strategy.ratios.grow}% W:${strategy.ratios.weaken}%`);
        
        // ══════════════════════════════════════════════════════════════
        // PHASE 5 : DEPLOYMENT MASSIF
        // ══════════════════════════════════════════════════════════════
        
        dbg.verbose(`${ICONS.ROCKET} Deploying workers massively...`);
        
        // Copier workers sur tous les hosts
        for (const host of rootedServers) {
            for (const script of Object.values(WORKER_SCRIPTS)) {
                await ns.scp(script, host);
            }
        }
        
        // Deploy selon stratégie
        const deployed = deployMassive(ns, dbg, rootedServers, target, strategy);
        
        dbg.normal(`${ICONS.ROCKET} Deployed: ${deployed.total} threads`);
        dbg.verbose(`  H:${deployed.hack} G:${deployed.grow} W:${deployed.weaken}`);
        
        // ══════════════════════════════════════════════════════════════
        // PHASE 6 : STATS & MONITORING
        // ══════════════════════════════════════════════════════════════
        
        const currentMoney = ns.getServerMoneyAvailable("home");
        const moneyGain = currentMoney - lastMoney;
        const revenuePerSecond = moneyGain / (UPDATE_INTERVAL / 1000);
        
        dbg.separator();
        dbg.money("Money", currentMoney);
        
        if (moneyGain > 0) {
            dbg.success(`Gain: +$${ns.formatNumber(moneyGain)} (+$${ns.formatNumber(revenuePerSecond)}/s)`);
        } else if (moneyGain < 0) {
            dbg.normal(`${ICONS.INFO} Spent: $${ns.formatNumber(Math.abs(moneyGain))}`);
        }
        
        dbg.normal(`${ICONS.TARGET} Hacking: ${ns.getHackingLevel()}`);
        
        // Save state
        await stateMgr.save("improved-creeper-status.json", {
            timestamp: timestamp,
            cycle: cycle,
            target: target,
            strategy: strategy,
            deployed: deployed,
            rootedServers: rootedServers.length,
            totalServers: allServers.length,
            ramAnalysis: ramAnalysis,
            playerMoney: currentMoney,
            moneyGain: moneyGain,
            estimatedRevenue: revenuePerSecond,
            hackingLevel: ns.getHackingLevel(),
            targetInfo: targetInfo
        });
        
        dbg.separator();
        dbg.normal(`${ICONS.TIMER} Next cycle in ${UPDATE_INTERVAL/1000}s...`);
        
        lastMoney = currentMoney;
        await ns.sleep(UPDATE_INTERVAL);
    }
}

// ══════════════════════════════════════════════════════════════
// NETWORK FUNCTIONS
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
        const myHackLevel = ns.getHackingLevel();
        
        if (myHackLevel < reqHackLevel) continue;
        
        const reqPorts = ns.getServerNumPortsRequired(host);
        let openedPorts = 0;
        
        if (ns.fileExists("BruteSSH.exe", "home")) {
            ns.brutessh(host);
            openedPorts++;
        }
        if (ns.fileExists("FTPCrack.exe", "home")) {
            ns.ftpcrack(host);
            openedPorts++;
        }
        if (ns.fileExists("relaySMTP.exe", "home")) {
            ns.relaysmtp(host);
            openedPorts++;
        }
        if (ns.fileExists("HTTPWorm.exe", "home")) {
            ns.httpworm(host);
            openedPorts++;
        }
        if (ns.fileExists("SQLInject.exe", "home")) {
            ns.sqlinject(host);
            openedPorts++;
        }
        
        if (openedPorts >= reqPorts) {
            try {
                ns.nuke(host);
                rootedCount++;
                dbg.verbose(`${ICONS.SUCCESS} Rooted: ${host}`);
            } catch (error) {
                dbg.ultra(`${ICONS.ERROR} Failed to nuke ${host}: ${error}`);
            }
        }
    }
    
    return rootedCount;
}

// ══════════════════════════════════════════════════════════════
// RAM ANALYSIS
// ══════════════════════════════════════════════════════════════

function analyzeNetworkRAM(ns, servers) {
    let totalMax = 0;
    let totalUsed = 0;
    let totalAvailable = 0;
    
    const hostsDetails = [];
    
    for (const host of servers) {
        const maxRam = ns.getServerMaxRam(host);
        const usedRam = ns.getServerUsedRam(host);
        const availableRam = maxRam - usedRam;
        
        totalMax += maxRam;
        totalUsed += usedRam;
        totalAvailable += availableRam;
        
        if (availableRam > 0) {
            hostsDetails.push({
                hostname: host,
                maxRam: maxRam,
                usedRam: usedRam,
                availableRam: availableRam
            });
        }
    }
    
    // Sort by available RAM (descending)
    hostsDetails.sort((a, b) => b.availableRam - a.availableRam);
    
    return {
        totalMax: totalMax,
        totalUsed: totalUsed,
        totalAvailable: totalAvailable,
        usagePercent: totalMax > 0 ? (totalUsed / totalMax) * 100 : 0,
        hostsDetails: hostsDetails
    };
}

// ══════════════════════════════════════════════════════════════
// TARGET SELECTION
// ══════════════════════════════════════════════════════════════

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
    
    dbg.ultra(`${ICONS.BRAIN} Top targets:`);
    for (let i = 0; i < Math.min(3, scored.length); i++) {
        dbg.ultra(`  ${i+1}. ${scored[i].host} (score: ${scored[i].score.toFixed(2)})`);
    }
    
    return scored[0].host;
}

function getTargetInfo(ns, target) {
    const maxMoney = ns.getServerMaxMoney(target);
    const currentMoney = ns.getServerMoneyAvailable(target);
    const minSecurity = ns.getServerMinSecurityLevel(target);
    const currentSecurity = ns.getServerSecurityLevel(target);
    
    return {
        maxMoney: maxMoney,
        currentMoney: currentMoney,
        moneyPercent: maxMoney > 0 ? (currentMoney / maxMoney) * 100 : 0,
        minSecurity: minSecurity,
        currentSecurity: currentSecurity,
        securityDelta: currentSecurity - minSecurity
    };
}

// ══════════════════════════════════════════════════════════════
// STRATEGY DECISION
// ══════════════════════════════════════════════════════════════

function decideStrategy(ns, targetInfo) {
    // Mode 1 : WEAKEN (security trop élevée)
    if (targetInfo.securityDelta > SECURITY_THRESHOLD) {
        return {
            mode: "weaken",
            reason: `Security too high (Δ${targetInfo.securityDelta.toFixed(2)} > ${SECURITY_THRESHOLD})`,
            ratios: { hack: 0, grow: 0, weaken: 100 }
        };
    }
    
    // Mode 2 : GROW (argent trop bas)
    if (targetInfo.moneyPercent < MONEY_THRESHOLD * 100) {
        return {
            mode: "grow",
            reason: `Money too low (${targetInfo.moneyPercent.toFixed(1)}% < ${MONEY_THRESHOLD * 100}%)`,
            ratios: { hack: 0, grow: 70, weaken: 30 }
        };
    }
    
    // Mode 3 : HACK (optimal)
    return {
        mode: "hack",
        reason: `Optimal conditions (sec OK, money OK)`,
        ratios: { hack: 20, grow: 60, weaken: 20 }
    };
}

// ══════════════════════════════════════════════════════════════
// DEPLOYMENT MASSIF
// ══════════════════════════════════════════════════════════════

function deployMassive(ns, dbg, servers, target, strategy) {
    const ramAnalysis = analyzeNetworkRAM(ns, servers);
    const hostsDetails = ramAnalysis.hostsDetails;
    
    let totalDeployed = { hack: 0, grow: 0, weaken: 0, total: 0 };
    
    // Pour chaque host avec RAM disponible
    for (const hostInfo of hostsDetails) {
        const host = hostInfo.hostname;
        const availableRAM = hostInfo.availableRam;
        
        // Skip si pas assez de RAM
        if (availableRAM < 1.75) continue;
        
        // Calculer threads max pour ce host
        const maxThreads = Math.floor(availableRAM / 1.75);  // Use max script RAM
        
        // Distribuer selon ratios
        const hackThreads = Math.floor(maxThreads * strategy.ratios.hack / 100);
        const growThreads = Math.floor(maxThreads * strategy.ratios.grow / 100);
        const weakenThreads = Math.floor(maxThreads * strategy.ratios.weaken / 100);
        
        // Kill processus existants
        const processes = ns.ps(host);
        for (const proc of processes) {
            if (Object.values(WORKER_SCRIPTS).includes(proc.filename)) {
                ns.kill(proc.pid);
            }
        }
        
        // Deploy hack
        if (hackThreads > 0) {
            const pid = ns.exec(WORKER_SCRIPTS.hack, host, hackThreads, target);
            if (pid > 0) {
                totalDeployed.hack += hackThreads;
                dbg.ultra(`${ICONS.SUCCESS} ${host}: ${hackThreads}t hack`);
            }
        }
        
        // Deploy grow
        if (growThreads > 0) {
            const pid = ns.exec(WORKER_SCRIPTS.grow, host, growThreads, target);
            if (pid > 0) {
                totalDeployed.grow += growThreads;
                dbg.ultra(`${ICONS.SUCCESS} ${host}: ${growThreads}t grow`);
            }
        }
        
        // Deploy weaken
        if (weakenThreads > 0) {
            const pid = ns.exec(WORKER_SCRIPTS.weaken, host, weakenThreads, target);
            if (pid > 0) {
                totalDeployed.weaken += weakenThreads;
                dbg.ultra(`${ICONS.SUCCESS} ${host}: ${weakenThreads}t weaken`);
            }
        }
    }
    
    totalDeployed.total = totalDeployed.hack + totalDeployed.grow + totalDeployed.weaken;
    
    return totalDeployed;
}
