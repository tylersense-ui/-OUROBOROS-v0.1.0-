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
import { isServerReady } from "/lib/prep.js";
import { calculateHWGWRatios, calculatePrepRatios } from "/core/batcher.js";
import { deployHWGW, deployPrep } from "/core/dispatcher.js";
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
            
            // Calculate prep ratios (40/60)
            const prepRatios = calculatePrepRatios(ns, target);
            
            // Deploy prep via dispatcher
            const deployed = await deployPrep(ns, rootedHosts, target, prepRatios);
            
            dbg.normal(`${ICONS.ROCKET} Deployed PREP: ${deployed.total} threads (W:${deployed.weaken} G:${deployed.grow})`);
            
        } else {
            // MODE HACK
            dbg.normal(`${ICONS.BRAIN} Mode: HACK`);
            
            if (prepMode) {
                dbg.toastSuccess(`${target} is READY - Starting HACK mode!`);
                prepMode = false;
            }
            
            // Calculate ratios via batcher
            const ratios = calculateHWGWRatios(ns, target, HACK_PERCENT);
            
            dbg.verbose(`  📊 Ratios (calculated):`);
            dbg.verbose(`     Hack: ${ratios.hackThreads}t`);
            dbg.verbose(`     Weaken(H): ${ratios.weakenForHack}t`);
            dbg.verbose(`     Grow: ${ratios.growThreads}t`);
            dbg.verbose(`     Weaken(G): ${ratios.weakenForGrow}t`);
            dbg.verbose(`     Total: ${ratios.totalThreads}t (${ns.formatRam(ratios.totalRAM)})`);
            
            // Deploy hack via dispatcher
            const deployed = await deployHWGW(ns, rootedHosts, target, ratios);
            
            dbg.normal(`${ICONS.ROCKET} Deployed HACK: ${deployed.total} threads (H:${deployed.hack} W:${deployed.weaken} G:${deployed.grow})`);
        }
        
        // ══════════════════════════════════════════════════════════════
        // PHASE 5 : STATS
        // ══════════════════════════════════════════════════════════════
        
        const playerMoney = ns.getServerMoneyAvailable("home");
        const moneyGain = playerMoney - lastMoney;
        const revenuePerSecond = moneyGain / (UPDATE_INTERVAL / 1000);
        
        dbg.separator();
        dbg.money("Money", playerMoney);
        
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
            playerMoney: playerMoney,
            moneyGain,
            revenue: revenuePerSecond,
            hackingLevel: ns.getHackingLevel()
        });
        
        dbg.separator();
        dbg.normal(`${ICONS.TIMER} Next cycle in ${UPDATE_INTERVAL/1000}s...`);
        
        lastMoney = playerMoney;
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
