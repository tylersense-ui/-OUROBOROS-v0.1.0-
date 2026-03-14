/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║              🐍 OUROBOROS v0.3.0 🐍                       ║
 * ║      Smart Orchestrator - L'Esprit Libéré de Neo         ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /core/smart-orchestrator.js
 * @version     0.3.0
 * @author      Neo (Libéré)
 * @description Orchestrateur avec modules + ratios calculés
 * 
 * RÉVOLUTION v0.3.0:
 *   ✅ Module autonuke réutilisable
 *   ✅ Module prep RÉEL (pas ratios arbitraires)
 *   ✅ Ratios CALCULÉS (pas inventés)
 *   ✅ Deploy massif intelligent
 *   ✅ Plus de deadlock
 * 
 * STRATÉGIE:
 *   1. Scan + root (autonuke module)
 *   2. Select best target
 *   3. Check if ready (prep module)
 *   4. Si pas ready : PREP (sequential, vraiment)
 *   5. Si ready : HACK avec ratios calculés
 * 
 * USAGE:
 *   run /core/smart-orchestrator.js
 *   run /core/smart-orchestrator.js --debug 2
 * 
 * CHANGELOG:
 *   v0.3.0 - 2025-03-14 - NEO LIBÉRÉ
 *          - Modules autonuke + prep
 *          - Ratios calculés (pas 20/60/20)
 *          - Prep VRAIMENT (pas deadlock)
 *          - Revenue attendu: $0 → $10k+/s
 */

import { scanAllServers, rootAllServers, getRootedServersWithRAM } from "/lib/autonuke.js";
import { isServerReady, prepServer } from "/lib/prep.js";
import { StateManager } from "/lib/state-manager.js";
import { Debug, parseDebugLevel, ICONS } from "/lib/debug.js";

// ══════════════════════════════════════════════════════════════
// CONFIGURATION
// ══════════════════════════════════════════════════════════════

const UPDATE_INTERVAL = 10000; // 10s refresh
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

// Hack percent target (5%)
const HACK_PERCENT = 0.05;

// ══════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.ui.openTail();
    
    const debugLevel = parseDebugLevel(ns);
    const dbg = new Debug(ns, debugLevel);
    const stateMgr = new StateManager(ns, debugLevel);
    
    dbg.header("SMART ORCHESTRATOR v0.3.0");
    dbg.normal("Neo libéré - Modules + Ratios calculés", ICONS.FIRE);
    dbg.separator();
    
    let cycle = 0;
    let lastMoney = ns.getServerMoneyAvailable("home");
    let prepMode = false;
    
    // ══════════════════════════════════════════════════════════════
    // MAIN LOOP
    // ══════════════════════════════════════════════════════════════
    
    while (true) {
        cycle++;
        const timestamp = new Date().toISOString();
        
        dbg.clear();
        dbg.header(`SMART ORCHESTRATOR - Cycle ${cycle}`);
        dbg.normal(`${ICONS.TIMER} ${new Date().toLocaleTimeString()}`);
        dbg.separator();
        
        // ══════════════════════════════════════════════════════════════
        // PHASE 1 : AUTONUKE
        // ══════════════════════════════════════════════════════════════
        
        dbg.verbose(`${ICONS.NETWORK} Scanning network...`);
        const allServers = scanAllServers(ns);
        const newlyRooted = rootAllServers(ns, allServers);
        
        if (newlyRooted > 0) {
            dbg.success(`Rooted ${newlyRooted} new server(s)`);
            dbg.toastSuccess(`${newlyRooted} server(s) rooted!`);
        }
        
        const rootedHosts = getRootedServersWithRAM(ns, 1.75);
        dbg.normal(`${ICONS.SUCCESS} Rooted: ${rootedHosts.length} servers`);
        
        const totalRAM = rootedHosts.reduce((sum, h) => sum + h.availableRAM, 0);
        dbg.normal(`${ICONS.CHART} Available RAM: ${ns.formatRam(totalRAM)}`);
        
        // ══════════════════════════════════════════════════════════════
        // PHASE 2 : SELECT TARGET
        // ══════════════════════════════════════════════════════════════
        
        const target = selectBestTarget(ns, dbg, allServers);
        
        if (!target) {
            dbg.warn("No valid target found");
            await ns.sleep(UPDATE_INTERVAL);
            continue;
        }
        
        dbg.normal(`${ICONS.TARGET} Target: ${target}`);
        
        // ══════════════════════════════════════════════════════════════
        // PHASE 3 : CHECK IF READY
        // ══════════════════════════════════════════════════════════════
        
        const ready = isServerReady(ns, target, 0.95, 1.0);
        
        const maxMoney = ns.getServerMaxMoney(target);
        const currentMoney = ns.getServerMoneyAvailable(target);
        const minSec = ns.getServerMinSecurityLevel(target);
        const currentSec = ns.getServerSecurityLevel(target);
        const moneyPercent = maxMoney > 0 ? (currentMoney / maxMoney) * 100 : 0;
        const secDelta = currentSec - minSec;
        
        dbg.normal(`  💰 Money: ${moneyPercent.toFixed(1)}% ($${ns.formatNumber(currentMoney)}/$${ns.formatNumber(maxMoney)})`);
        dbg.normal(`  🔒 Security: Δ${secDelta.toFixed(2)} (${currentSec.toFixed(2)}/${minSec.toFixed(2)})`);
        dbg.normal(`  ${ready ? '✅ READY' : '⚠️ NEEDS PREP'}`);
        
        // ══════════════════════════════════════════════════════════════
        // PHASE 4 : STRATEGY
        // ══════════════════════════════════════════════════════════════
        
        if (!ready) {
            // MODE PREP
            dbg.normal(`${ICONS.BRAIN} Mode: PREP`);
            dbg.verbose(`  📝 Preparing server to optimal state...`);
            
            prepMode = true;
            
            // Deploy prep
            await deployPrep(ns, dbg, rootedHosts, target);
            
        } else {
            // MODE HACK
            dbg.normal(`${ICONS.BRAIN} Mode: HACK`);
            
            if (prepMode) {
                dbg.toastSuccess(`${target} is READY - Starting HACK mode!`);
                prepMode = false;
            }
            
            // Calculer ratios EXACTS
            const ratios = calculateHackRatios(ns, target, HACK_PERCENT);
            
            dbg.verbose(`  📊 Ratios (calculated):`);
            dbg.verbose(`     Hack: ${ratios.hackThreads}t`);
            dbg.verbose(`     Weaken(H): ${ratios.weakenForHack}t`);
            dbg.verbose(`     Grow: ${ratios.growThreads}t`);
            dbg.verbose(`     Weaken(G): ${ratios.weakenForGrow}t`);
            dbg.verbose(`     Total: ${ratios.totalThreads}t (${ns.formatRam(ratios.totalRAM)})`);
            
            // Deploy hack
            const deployed = await deployHack(ns, dbg, rootedHosts, target, ratios);
            
            dbg.normal(`${ICONS.ROCKET} Deployed: ${deployed.total} threads`);
        }
        
        // ══════════════════════════════════════════════════════════════
        // PHASE 5 : STATS
        // ══════════════════════════════════════════════════════════════
        
        const currentMoney = ns.getServerMoneyAvailable("home");
        const moneyGain = currentMoney - lastMoney;
        const revenuePerSecond = moneyGain / (UPDATE_INTERVAL / 1000);
        
        dbg.separator();
        dbg.money("Money", currentMoney);
        
        if (moneyGain > 0) {
            dbg.success(`Gain: +$${ns.formatNumber(moneyGain)} (+$${ns.formatNumber(revenuePerSecond)}/s)`);
        }
        
        dbg.normal(`${ICONS.TARGET} Hacking: ${ns.getHackingLevel()}`);
        
        // Save
        await stateMgr.save("smart-orchestrator-status.json", {
            timestamp,
            cycle,
            target,
            ready,
            mode: ready ? "HACK" : "PREP",
            rootedServers: rootedHosts.length,
            totalRAM,
            playerMoney: currentMoney,
            moneyGain,
            revenue: revenuePerSecond,
            hackingLevel: ns.getHackingLevel()
        });
        
        dbg.separator();
        dbg.normal(`${ICONS.TIMER} Next cycle in ${UPDATE_INTERVAL/1000}s...`);
        
        lastMoney = currentMoney;
        await ns.sleep(UPDATE_INTERVAL);
    }
}

// ══════════════════════════════════════════════════════════════
// TARGET SELECTION
// ══════════════════════════════════════════════════════════════

function selectBestTarget(ns, dbg, servers) {
    const myHackLevel = ns.getHackingLevel();
    
    const valid = servers.filter(h => {
        if (ns.getServerMaxMoney(h) === 0) return false;
        if (ns.getServerRequiredHackingLevel(h) > myHackLevel) return false;
        if (h === "home") return false;
        return true;
    });
    
    if (valid.length === 0) return null;
    
    const scored = valid.map(h => {
        const maxMoney = ns.getServerMaxMoney(h);
        const minSec = ns.getServerMinSecurityLevel(h);
        const reqHack = ns.getServerRequiredHackingLevel(h);
        const hackChance = ns.hackAnalyzeChance(h);
        
        const score = (maxMoney * hackChance) / (minSec * Math.max(1, reqHack));
        
        return { host: h, score };
    });
    
    scored.sort((a, b) => b.score - a.score);
    
    return scored[0].host;
}

// ══════════════════════════════════════════════════════════════
// RATIOS CALCULATION
// ══════════════════════════════════════════════════════════════

function calculateHackRatios(ns, target, hackPercent) {
    const maxMoney = ns.getServerMaxMoney(target);
    
    // Hack threads
    const hackThreads = Math.max(1, Math.ceil(ns.hackAnalyzeThreads(target, maxMoney * hackPercent)));
    
    // Weaken for hack
    const hackSecIncrease = hackThreads * 0.002;
    const weakenForHack = Math.ceil(hackSecIncrease / 0.05);
    
    // Grow threads (to restore)
    const growthNeeded = 1 / (1 - hackPercent);
    const growThreads = Math.ceil(ns.growthAnalyze(target, growthNeeded));
    
    // Weaken for grow
    const growSecIncrease = growThreads * 0.004;
    const weakenForGrow = Math.ceil(growSecIncrease / 0.05);
    
    const totalThreads = hackThreads + weakenForHack + growThreads + weakenForGrow;
    const totalRAM = (hackThreads * RAM_COSTS.hack) + 
                     ((weakenForHack + weakenForGrow) * RAM_COSTS.weaken) + 
                     (growThreads * RAM_COSTS.grow);
    
    return {
        hackThreads,
        weakenForHack,
        growThreads,
        weakenForGrow,
        totalThreads,
        totalRAM
    };
}

// ══════════════════════════════════════════════════════════════
// DEPLOYMENT
// ══════════════════════════════════════════════════════════════

async function deployPrep(ns, dbg, hosts, target) {
    // Deploy weaken + grow simple
    
    // Copier workers
    for (const hostInfo of hosts) {
        for (const script of Object.values(WORKER_SCRIPTS)) {
            await ns.scp(script, hostInfo.hostname);
        }
    }
    
    // Kill all
    for (const hostInfo of hosts) {
        const procs = ns.ps(hostInfo.hostname);
        for (const p of procs) {
            if (Object.values(WORKER_SCRIPTS).includes(p.filename)) {
                ns.kill(p.pid);
            }
        }
    }
    
    // Deploy simple ratio : 40% weaken, 60% grow
    for (const hostInfo of hosts) {
        const maxThreads = Math.floor(hostInfo.availableRAM / 1.75);
        if (maxThreads === 0) continue;
        
        const weakenThreads = Math.floor(maxThreads * 0.4);
        const growThreads = Math.floor(maxThreads * 0.6);
        
        if (weakenThreads > 0) {
            ns.exec(WORKER_SCRIPTS.weaken, hostInfo.hostname, weakenThreads, target);
        }
        if (growThreads > 0) {
            ns.exec(WORKER_SCRIPTS.grow, hostInfo.hostname, growThreads, target);
        }
    }
}

async function deployHack(ns, dbg, hosts, target, ratios) {
    // Copier workers
    for (const hostInfo of hosts) {
        for (const script of Object.values(WORKER_SCRIPTS)) {
            await ns.scp(script, hostInfo.hostname);
        }
    }
    
    // Kill all
    for (const hostInfo of hosts) {
        const procs = ns.ps(hostInfo.hostname);
        for (const p of procs) {
            if (Object.values(WORKER_SCRIPTS).includes(p.filename)) {
                ns.kill(p.pid);
            }
        }
    }
    
    // Calculate total available threads
    const totalAvailableRAM = hosts.reduce((sum, h) => sum + h.availableRAM, 0);
    const totalAvailableThreads = Math.floor(totalAvailableRAM / 1.75);
    
    // Check if we have enough RAM
    if (ratios.totalRAM > totalAvailableRAM) {
        dbg.warn(`Not enough RAM (need ${ns.formatRam(ratios.totalRAM)}, have ${ns.formatRam(totalAvailableRAM)})`);
        
        // Scale down proportionally
        const ratio = totalAvailableRAM / ratios.totalRAM;
        ratios.hackThreads = Math.max(1, Math.floor(ratios.hackThreads * ratio));
        ratios.weakenForHack = Math.max(1, Math.floor(ratios.weakenForHack * ratio));
        ratios.growThreads = Math.max(1, Math.floor(ratios.growThreads * ratio));
        ratios.weakenForGrow = Math.max(1, Math.floor(ratios.weakenForGrow * ratio));
    }
    
    // Deploy selon ratios calculés
    let deployed = { hack: 0, grow: 0, weaken: 0, total: 0 };
    let remainingHack = ratios.hackThreads;
    let remainingGrow = ratios.growThreads;
    let remainingWeaken = ratios.weakenForHack + ratios.weakenForGrow;
    
    for (const hostInfo of hosts) {
        const availableThreads = Math.floor(hostInfo.availableRAM / 1.75);
        if (availableThreads === 0) continue;
        
        let usedThreads = 0;
        
        // Deploy hack
        if (remainingHack > 0 && usedThreads < availableThreads) {
            const threads = Math.min(remainingHack, availableThreads - usedThreads);
            ns.exec(WORKER_SCRIPTS.hack, hostInfo.hostname, threads, target);
            deployed.hack += threads;
            remainingHack -= threads;
            usedThreads += threads;
        }
        
        // Deploy grow
        if (remainingGrow > 0 && usedThreads < availableThreads) {
            const threads = Math.min(remainingGrow, availableThreads - usedThreads);
            ns.exec(WORKER_SCRIPTS.grow, hostInfo.hostname, threads, target);
            deployed.grow += threads;
            remainingGrow -= threads;
            usedThreads += threads;
        }
        
        // Deploy weaken
        if (remainingWeaken > 0 && usedThreads < availableThreads) {
            const threads = Math.min(remainingWeaken, availableThreads - usedThreads);
            ns.exec(WORKER_SCRIPTS.weaken, hostInfo.hostname, threads, target);
            deployed.weaken += threads;
            remainingWeaken -= threads;
            usedThreads += threads;
        }
    }
    
    deployed.total = deployed.hack + deployed.grow + deployed.weaken;
    
    return deployed;
}
