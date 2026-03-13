/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║              🐍 OUROBOROS v0.1.1 🐍                       ║
 * ║    Early Creeper - Le Serpent Rampant du Réseau          ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /core/early-creeper.js
 * @version     0.1.1
 * @author      Claude (Godlike AI Operator)
 * @description Orchestrateur early-game (Sequential WGH loop)
 * 
 * USAGE:
 *   run /core/early-creeper.js
 *   run /core/early-creeper.js --debug 2
 * 
 * FEATURES:
 *   🌐 Auto-scan réseau continu
 *   🔓 Auto-root progressif (unlock avec hacking level)
 *   📦 Deploy workers automatique (hack/grow/weaken)
 *   🎯 Target sélection intelligente
 *   💰 Optimisation revenue ($$$)
 *   ⚡ Adaptation dynamique au hacking level
 * 
 * STRATÉGIE:
 *   Phase 1 (Hacking 1-50) : Sequential WGH sur n00dles
 *   Phase 2 (Hacking 50+)  : Progressive target upgrade
 *   Phase 3 (Hacking 100+) : Multi-target parallèle
 * 
 * ARGUMENTS:
 *   --debug <N> : Debug level 0-3 (optionnel)
 * 
 * CHANGELOG:
 *   v0.1.1 - 2025-01-XX - Création initiale
 *          - Sequential WGH loop
 *          - Auto-root progression
 *          - Smart target selection
 *          - RAM management
 */

import { StateManager } from "/lib/state-manager.js";
import { Debug, parseDebugLevel, ICONS } from "/lib/debug.js";

// ══════════════════════════════════════════════════════════════
// CONFIGURATION
// ══════════════════════════════════════════════════════════════

const UPDATE_INTERVAL = 5000; // 5s entre chaque cycle
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

// Seuils de sécurité
const SECURITY_THRESHOLD = 5; // Ne hack que si security < min + 5
const MONEY_THRESHOLD = 0.75; // Ne hack que si money > 75% max

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
    
    dbg.header("EARLY CREEPER v0.1.1");
    dbg.normal("Le Serpent rampe dans le réseau...", ICONS.SNAKE);
    dbg.separator();
    
    let cycle = 0;
    
    // ══════════════════════════════════════════════════════════════
    // MAIN LOOP
    // ══════════════════════════════════════════════════════════════
    
    while (true) {
        cycle++;
        const timestamp = new Date().toISOString();
        
        dbg.clear();
        dbg.header(`EARLY CREEPER - Cycle ${cycle}`);
        dbg.normal(`${ICONS.TIMER} ${new Date().toLocaleTimeString()}`);
        dbg.separator();
        
        // ══════════════════════════════════════════════════════════════
        // PHASE 1 : SCAN RÉSEAU
        // ══════════════════════════════════════════════════════════════
        
        dbg.verbose(`${ICONS.NETWORK} Scanning network...`);
        const allServers = scanNetwork(ns);
        dbg.normal(`${ICONS.NETWORK} Found ${allServers.length} servers`);
        
        // ══════════════════════════════════════════════════════════════
        // PHASE 2 : AUTO-ROOT
        // ══════════════════════════════════════════════════════════════
        
        dbg.verbose(`${ICONS.LOCK} Attempting auto-root...`);
        const rootedCount = autoRoot(ns, dbg, allServers);
        
        if (rootedCount > 0) {
            dbg.success(`Rooted ${rootedCount} new server(s)`);
            dbg.toastSuccess(`${rootedCount} server(s) rooted!`);
        }
        
        // ══════════════════════════════════════════════════════════════
        // PHASE 3 : COLLECT ROOTED SERVERS
        // ══════════════════════════════════════════════════════════════
        
        const rootedServers = allServers.filter(host => ns.hasRootAccess(host));
        dbg.normal(`${ICONS.SUCCESS} Rooted servers: ${rootedServers.length}`);
        
        // Calculer RAM disponible
        const availableRAM = calculateAvailableRAM(ns, rootedServers);
        dbg.verbose(`${ICONS.CHART} Total available RAM: ${ns.formatRam(availableRAM)}`);
        
        // ══════════════════════════════════════════════════════════════
        // PHASE 4 : SELECT TARGET
        // ══════════════════════════════════════════════════════════════
        
        const target = selectBestTarget(ns, dbg, allServers);
        
        if (!target) {
            dbg.warn("No valid target found");
            await ns.sleep(UPDATE_INTERVAL);
            continue;
        }
        
        dbg.normal(`${ICONS.TARGET} Target: ${target}`);
        
        const targetInfo = getTargetInfo(ns, target);
        dbg.verbose(`  Max money: $${ns.formatNumber(targetInfo.maxMoney)}`);
        dbg.verbose(`  Current: $${ns.formatNumber(targetInfo.currentMoney)} (${targetInfo.moneyPercent.toFixed(1)}%)`);
        dbg.verbose(`  Security: ${targetInfo.currentSecurity.toFixed(2)} (min: ${targetInfo.minSecurity})`);
        
        // ══════════════════════════════════════════════════════════════
        // PHASE 5 : DEPLOY WORKERS
        // ══════════════════════════════════════════════════════════════
        
        dbg.verbose(`${ICONS.ROCKET} Deploying workers...`);
        
        // Copier scripts sur tous les serveurs rootés
        for (const host of rootedServers) {
            for (const script of Object.values(WORKER_SCRIPTS)) {
                await ns.scp(script, host);
            }
        }
        
        // Décider quelle action prioriser
        const action = decideAction(ns, targetInfo);
        dbg.normal(`${ICONS.BRAIN} Action: ${action.toUpperCase()}`);
        
        // Déployer workers selon l'action
        const deployed = deployWorkers(ns, dbg, rootedServers, target, action);
        
        dbg.normal(`${ICONS.ROCKET} Deployed ${deployed} thread(s)`);
        
        // ══════════════════════════════════════════════════════════════
        // PHASE 6 : STATS & MONITORING
        // ══════════════════════════════════════════════════════════════
        
        const playerMoney = ns.getServerMoneyAvailable("home");
        const hackingLevel = ns.getHackingLevel();
        
        dbg.separator();
        dbg.money("Money", playerMoney);
        dbg.normal(`${ICONS.TARGET} Hacking: ${hackingLevel}`);
        dbg.normal(`${ICONS.CHART} Deployed threads: ${deployed}`);
        
        // Sauvegarder state
        await stateMgr.save("creeper-status.json", {
            timestamp: timestamp,
            cycle: cycle,
            target: target,
            action: action,
            deployedThreads: deployed,
            rootedServers: rootedServers.length,
            totalServers: allServers.length,
            playerMoney: playerMoney,
            hackingLevel: hackingLevel
        });
        
        dbg.separator();
        dbg.normal(`${ICONS.TIMER} Next cycle in ${UPDATE_INTERVAL/1000}s...`);
        
        await ns.sleep(UPDATE_INTERVAL);
    }
}

// ══════════════════════════════════════════════════════════════
// NETWORK FUNCTIONS
// ══════════════════════════════════════════════════════════════

/**
 * Scan réseau complet (BFS)
 * @param {NS} ns
 * @returns {Array<string>}
 */
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

/**
 * Auto-root tous les serveurs possibles
 * @param {NS} ns
 * @param {Debug} dbg
 * @param {Array<string>} servers
 * @returns {number} Nombre de serveurs rootés
 */
function autoRoot(ns, dbg, servers) {
    let rootedCount = 0;
    
    for (const host of servers) {
        // Skip si déjà root
        if (ns.hasRootAccess(host)) continue;
        
        // Vérifier hacking level requis
        const reqHackLevel = ns.getServerRequiredHackingLevel(host);
        const myHackLevel = ns.getHackingLevel();
        
        if (myHackLevel < reqHackLevel) continue;
        
        // Vérifier ports requis
        const reqPorts = ns.getServerNumPortsRequired(host);
        
        // Ouvrir ports disponibles
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
        
        // Si assez de ports, nuke
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
// TARGET SELECTION
// ══════════════════════════════════════════════════════════════

/**
 * Sélectionner meilleur target
 * @param {NS} ns
 * @param {Debug} dbg
 * @param {Array<string>} servers
 * @returns {string|null}
 */
function selectBestTarget(ns, dbg, servers) {
    const myHackLevel = ns.getHackingLevel();
    
    // Filtrer serveurs valides
    const validTargets = servers.filter(host => {
        // Skip serveurs sans argent
        if (ns.getServerMaxMoney(host) === 0) return false;
        
        // Skip serveurs trop difficiles
        if (ns.getServerRequiredHackingLevel(host) > myHackLevel) return false;
        
        // Skip home
        if (host === "home") return false;
        
        return true;
    });
    
    if (validTargets.length === 0) return null;
    
    // Scorer chaque target
    const scored = validTargets.map(host => {
        const maxMoney = ns.getServerMaxMoney(host);
        const minSec = ns.getServerMinSecurityLevel(host);
        const reqHack = ns.getServerRequiredHackingLevel(host);
        const hackChance = ns.hackAnalyzeChance(host);
        
        // Score = (argent potentiel * chance) / (sécurité * difficulté)
        const score = (maxMoney * hackChance) / (minSec * Math.max(1, reqHack));
        
        return { host, score };
    });
    
    // Trier par score décroissant
    scored.sort((a, b) => b.score - a.score);
    
    dbg.ultra(`${ICONS.BRAIN} Top targets:`);
    for (let i = 0; i < Math.min(3, scored.length); i++) {
        dbg.ultra(`  ${i+1}. ${scored[i].host} (score: ${scored[i].score.toFixed(2)})`);
    }
    
    return scored[0].host;
}

/**
 * Obtenir infos target
 * @param {NS} ns
 * @param {string} target
 * @returns {object}
 */
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

/**
 * Décider action (weaken/grow/hack)
 * @param {NS} ns
 * @param {object} targetInfo
 * @returns {string}
 */
function decideAction(ns, targetInfo) {
    // Si sécurité trop élevée → weaken
    if (targetInfo.securityDelta > SECURITY_THRESHOLD) {
        return "weaken";
    }
    
    // Si argent trop faible → grow
    if (targetInfo.moneyPercent < MONEY_THRESHOLD * 100) {
        return "grow";
    }
    
    // Sinon → hack
    return "hack";
}

// ══════════════════════════════════════════════════════════════
// RAM & DEPLOYMENT
// ══════════════════════════════════════════════════════════════

/**
 * Calculer RAM disponible sur réseau
 * @param {NS} ns
 * @param {Array<string>} servers
 * @returns {number}
 */
function calculateAvailableRAM(ns, servers) {
    let total = 0;
    
    for (const host of servers) {
        const maxRam = ns.getServerMaxRam(host);
        const usedRam = ns.getServerUsedRam(host);
        total += (maxRam - usedRam);
    }
    
    return total;
}

/**
 * Déployer workers sur réseau
 * @param {NS} ns
 * @param {Debug} dbg
 * @param {Array<string>} servers
 * @param {string} target
 * @param {string} action
 * @returns {number} Threads déployés
 */
function deployWorkers(ns, dbg, servers, target, action) {
    const script = WORKER_SCRIPTS[action];
    const ramCost = RAM_COSTS[action];
    
    let totalThreads = 0;
    
    // Déployer sur chaque serveur
    for (const host of servers) {
        const maxRam = ns.getServerMaxRam(host);
        const usedRam = ns.getServerUsedRam(host);
        const availableRam = maxRam - usedRam;
        
        // Skip si pas assez de RAM
        if (availableRam < ramCost) continue;
        
        // Calculer threads max
        const threads = Math.floor(availableRam / ramCost);
        
        if (threads === 0) continue;
        
        // Tuer processus existants pour ce script
        const processes = ns.ps(host);
        for (const proc of processes) {
            if (proc.filename === script) {
                ns.kill(proc.pid);
            }
        }
        
        // Lancer worker
        const pid = ns.exec(script, host, threads, target);
        
        if (pid > 0) {
            totalThreads += threads;
            dbg.ultra(`${ICONS.SUCCESS} ${host}: ${threads} thread(s) ${action}`);
        }
    }
    
    return totalThreads;
}
