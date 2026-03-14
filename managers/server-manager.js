/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║              🐍 OUROBOROS v0.1.0 🐍                       ║
 * ║    Server Manager - L'Architecte des Purchased Servers   ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /managers/server-manager.js
 * @version     0.1.0
 * @author      Claude (Godlike AI Operator)
 * @description Gestionnaire intelligent purchased servers
 * 
 * USAGE:
 *   run /managers/server-manager.js
 *   run /managers/server-manager.js --debug 2
 *   run /managers/server-manager.js --once
 * 
 * FEATURES:
 *   🏗️  Auto-achat purchased servers (25 max)
 *   🎭 Noms Matrix/cyberpunk épiques
 *   ⬆️  Upgrade progressif RAM (8→16→32→64→128→256→512→1024)
 *   💰 Smart budgeting (garde réserve sécurité)
 *   📊 Tracking état dans /state/servers-status.json
 *   🎯 Priorisation intelligente (achat → upgrade)
 * 
 * NOMS SERVERS (25):
 *   morpheus, trinity, neo, cypher, oracle, tank, dozer, apoc
 *   switch, mouse, seraph, niobe, ghost, architect, merovingian
 *   persephone, keymaker, sentinel, agent-smith, deus-ex-machina
 *   trainman, zion, nebuchadnezzar, logos, mjolnir
 * 
 * ARGUMENTS:
 *   --debug <N> : Debug level 0-3 (optionnel)
 *   --once      : Run once and exit (no loop)
 * 
 * CHANGELOG:
 *   v0.1.0 - 2025-01-XX - Création initiale
 *          - 25 noms Matrix/cyberpunk
 *          - Smart budgeting system
 *          - Progressive RAM upgrade
 *          - State tracking
 */

import { StateManager } from "/lib/state-manager.js";
import { Debug, parseDebugLevel, ICONS } from "/lib/debug.js";

// ══════════════════════════════════════════════════════════════
// CONFIGURATION
// ══════════════════════════════════════════════════════════════

const UPDATE_INTERVAL = 60000; // 60s between cycles
const RESERVE_RATIO = 0.20; // Garder 20% budget en réserve
const MIN_RESERVE = 100000; // Minimum $100k en réserve

// 25 noms Matrix/cyberpunk pour purchased servers
const SERVER_NAMES = [
    "morpheus",           // Le guide
    "trinity",            // La guerrière
    "neo",                // L'élu
    "cypher",             // Le traître
    "oracle",             // La prophétesse
    "tank",               // L'opérateur
    "dozer",              // Le solide
    "apoc",               // L'apocalypse
    "switch",             // La rapide
    "mouse",              // Le petit génie
    "seraph",             // Le gardien
    "niobe",              // La capitaine
    "ghost",              // Le fantôme
    "architect",          // Le créateur
    "merovingian",        // Le contrebandier
    "persephone",         // La séductrice
    "keymaker",           // L'ouvreur
    "sentinel",           // Le chasseur
    "agent-smith",        // Le virus
    "deus-ex-machina",    // Le dieu machine
    "trainman",           // Le passeur
    "zion",               // Le refuge
    "nebuchadnezzar",     // Le vaisseau
    "logos",              // Le second vaisseau
    "mjolnir"             // Le marteau
];

// RAM progression tiers
const RAM_TIERS = [8, 16, 32, 64, 128, 256, 512, 1024];

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
    
    const onceMode = ns.args.includes("--once");
    
    dbg.header("SERVER MANAGER v0.1.0");
    dbg.normal("L'Architecte construit la Matrix...", ICONS.BRAIN);
    dbg.separator();
    
    if (onceMode) {
        dbg.normal(`${ICONS.INFO} Running in ONCE mode (single pass)`);
    } else {
        dbg.normal(`${ICONS.INFO} Running in LOOP mode (${UPDATE_INTERVAL/1000}s interval)`);
    }
    
    dbg.separator();
    
    let cycle = 0;
    
    // ══════════════════════════════════════════════════════════════
    // MAIN LOOP
    // ══════════════════════════════════════════════════════════════
    
    do {
        cycle++;
        const timestamp = new Date().toISOString();
        
        if (!onceMode) {
            dbg.clear();
            dbg.header(`SERVER MANAGER - Cycle ${cycle}`);
            dbg.normal(`${ICONS.TIMER} ${new Date().toLocaleTimeString()}`);
            dbg.separator();
        }
        
        // ══════════════════════════════════════════════════════════════
        // 1️⃣ COLLECT STATUS
        // ══════════════════════════════════════════════════════════════
        
        const currentMoney = ns.getServerMoneyAvailable("home");
        const purchasedServers = ns.getPurchasedServers();
        const serversCount = purchasedServers.length;
        const maxServers = ns.getPurchasedServerLimit();
        
        dbg.money("Available", currentMoney);
        dbg.normal(`${ICONS.CHART} Purchased servers: ${serversCount}/${maxServers}`);
        
        // Calculer réserve sécurité
        const reserve = Math.max(MIN_RESERVE, currentMoney * RESERVE_RATIO);
        const budgetAvailable = currentMoney - reserve;
        
        dbg.verbose(`${ICONS.LOCK} Reserve: $${ns.formatNumber(reserve)}`);
        dbg.verbose(`${ICONS.MONEY} Budget available: $${ns.formatNumber(budgetAvailable)}`);
        
        dbg.separator();
        
        // ══════════════════════════════════════════════════════════════
        // 2️⃣ STRATEGY DECISION
        // ══════════════════════════════════════════════════════════════
        
        let actionTaken = false;
        
        // Priorité 1: Acheter serveurs si < 25
        if (serversCount < maxServers) {
            dbg.normal(`${ICONS.BRAIN} Strategy: BUY servers (${serversCount}/25)`);
            actionTaken = await buyNextServer(ns, dbg, budgetAvailable);
        }
        // Priorité 2: Upgrader serveurs existants
        else {
            dbg.normal(`${ICONS.BRAIN} Strategy: UPGRADE servers`);
            actionTaken = await upgradeServers(ns, dbg, budgetAvailable);
        }
        
        if (!actionTaken) {
            dbg.normal(`${ICONS.INFO} No action taken (insufficient budget or all maxed)`);
        }
        
        dbg.separator();
        
        // ══════════════════════════════════════════════════════════════
        // 3️⃣ SAVE STATUS
        // ══════════════════════════════════════════════════════════════
        
        const status = collectServerStatus(ns);
        await stateMgr.save("servers-status.json", {
            timestamp: timestamp,
            cycle: cycle,
            totalServers: serversCount,
            maxServers: maxServers,
            currentMoney: currentMoney,
            reserve: reserve,
            budgetAvailable: budgetAvailable,
            servers: status
        });
        
        dbg.verbose(`${ICONS.SUCCESS} Status saved`);
        dbg.separator();
        
        if (!onceMode) {
            dbg.normal(`${ICONS.TIMER} Next cycle in ${UPDATE_INTERVAL/1000}s...`);
            await ns.sleep(UPDATE_INTERVAL);
        }
        
    } while (!onceMode);
    
    if (onceMode) {
        dbg.normal(`${ICONS.SUCCESS} Single pass completed`);
    }
}

// ══════════════════════════════════════════════════════════════
// BUY FUNCTIONS
// ══════════════════════════════════════════════════════════════

/**
 * Acheter prochain serveur si budget permet
 * @param {NS} ns
 * @param {Debug} dbg
 * @param {number} budget
 * @returns {Promise<boolean>} True si achat effectué
 */
async function buyNextServer(ns, dbg, budget) {
    const purchasedServers = ns.getPurchasedServers();
    const nextIndex = purchasedServers.length;
    
    if (nextIndex >= SERVER_NAMES.length) {
        dbg.warn("All 25 servers already purchased");
        return false;
    }
    
    const serverName = SERVER_NAMES[nextIndex];
    const startRAM = 8; // Commencer avec 8GB
    const cost = ns.getPurchasedServerCost(startRAM);
    
    dbg.verbose(`${ICONS.INFO} Next server: ${serverName} (${startRAM}GB)`);
    dbg.verbose(`${ICONS.MONEY} Cost: $${ns.formatNumber(cost)}`);
    
    if (budget < cost) {
        dbg.verbose(`${ICONS.WARNING} Insufficient budget ($${ns.formatNumber(budget)} < $${ns.formatNumber(cost)})`);
        return false;
    }
    
    // Acheter
    const hostname = ns.purchaseServer(serverName, startRAM);
    
    if (hostname) {
        dbg.success(`Purchased: ${hostname} (${startRAM}GB)`);
        dbg.toastSuccess(`Server ${hostname} purchased!`);
        ns.tprint(`${ICONS.SUCCESS} Server ${hostname} purchased for $${ns.formatNumber(cost)}`);
        return true;
    } else {
        dbg.error(`Failed to purchase ${serverName}`);
        return false;
    }
}

/**
 * Upgrader serveurs existants si possible
 * @param {NS} ns
 * @param {Debug} dbg
 * @param {number} budget
 * @returns {Promise<boolean>} True si upgrade effectué
 */
async function upgradeServers(ns, dbg, budget) {
    const purchasedServers = ns.getPurchasedServers();
    
    // Trouver serveur avec plus petit RAM
    let minRAM = Infinity;
    let targetServer = null;
    
    for (const server of purchasedServers) {
        const ram = ns.getServerMaxRam(server);
        if (ram < minRAM && ram < 1024) { // Pas déjà au max
            minRAM = ram;
            targetServer = server;
        }
    }
    
    if (!targetServer) {
        dbg.normal(`${ICONS.SUCCESS} All servers at max RAM (1024GB)`);
        return false;
    }
    
    // Trouver prochain tier RAM
    const currentRAM = ns.getServerMaxRam(targetServer);
    const nextRAM = getNextRAMTier(currentRAM);
    
    if (!nextRAM) {
        dbg.verbose(`${targetServer} already at max tier`);
        return false;
    }
    
    const cost = ns.getPurchasedServerUpgradeCost(targetServer, nextRAM);
    
    dbg.verbose(`${ICONS.INFO} Upgrade candidate: ${targetServer}`);
    dbg.verbose(`${ICONS.CHART} ${currentRAM}GB → ${nextRAM}GB`);
    dbg.verbose(`${ICONS.MONEY} Cost: $${ns.formatNumber(cost)}`);
    
    if (budget < cost) {
        dbg.verbose(`${ICONS.WARNING} Insufficient budget ($${ns.formatNumber(budget)} < $${ns.formatNumber(cost)})`);
        return false;
    }
    
    // Upgrader
    const success = ns.upgradePurchasedServer(targetServer, nextRAM);
    
    if (success) {
        dbg.success(`Upgraded: ${targetServer} (${currentRAM}GB → ${nextRAM}GB)`);
        dbg.toastSuccess(`${targetServer} upgraded to ${nextRAM}GB!`);
        ns.tprint(`${ICONS.SUCCESS} Server ${targetServer} upgraded to ${nextRAM}GB for $${ns.formatNumber(cost)}`);
        return true;
    } else {
        dbg.error(`Failed to upgrade ${targetServer}`);
        return false;
    }
}

// ══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════════

/**
 * Obtenir prochain tier RAM
 * @param {number} currentRAM
 * @returns {number|null}
 */
function getNextRAMTier(currentRAM) {
    for (const tier of RAM_TIERS) {
        if (tier > currentRAM) {
            return tier;
        }
    }
    return null; // Déjà au max
}

/**
 * Collecter status tous purchased servers
 * @param {NS} ns
 * @returns {Array<object>}
 */
function collectServerStatus(ns) {
    const purchasedServers = ns.getPurchasedServers();
    const status = [];
    
    for (const server of purchasedServers) {
        const maxRAM = ns.getServerMaxRam(server);
        const usedRAM = ns.getServerUsedRam(server);
        const processes = ns.ps(server);
        
        status.push({
            hostname: server,
            maxRAM: maxRAM,
            usedRAM: usedRAM,
            availableRAM: maxRAM - usedRAM,
            processCount: processes.length,
            ramUsagePercent: maxRAM > 0 ? (usedRAM / maxRAM) * 100 : 0
        });
    }
    
    return status;
}
