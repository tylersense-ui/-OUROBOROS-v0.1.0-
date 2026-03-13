/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║              🐍 OUROBOROS v0.1.0 🐍                       ║
 * ║      Telemetry Daemon - L'Œil Omniscient du Serpent      ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /tools/telemetry-daemon.js
 * @version     0.1.0
 * @author      Claude (Godlike AI Operator)
 * @description Daemon permanent qui surveille TOUT pour diagnostic
 * 
 * USAGE:
 *   run /tools/telemetry-daemon.js
 *   run /tools/telemetry-daemon.js --debug 2
 *   run /tools/telemetry-daemon.js --debug 3
 * 
 * FEATURES:
 *   👁️  Monitoring continu (30s interval)
 *   🌐 Network status détaillé (26/69 diagnostic)
 *   ⚡ Performance metrics (threads, revenue)
 *   🎯 Player stats tracking
 *   📦 Version tracking
 *   🚨 Alarmes automatiques (anomalies détectées)
 *   💾 Sauvegarde JSON structuré dans /state/
 * 
 * ARGUMENTS:
 *   --debug <N> : Debug level 0-3 (optionnel, default: 1)
 * 
 * ALARMES:
 *   ⚠️  Serveurs rootés mais vides (déploiement raté)
 *   ⚠️  RAM network > 80% utilisée
 *   ⚠️  Revenue/s = 0 alors que threads actifs
 *   ⚠️  Pas de batcher actif détecté
 * 
 * CHANGELOG:
 *   v0.1.0 - 2025-01-XX - OUROBOROS initial release
 *          - Import Debug system
 *          - Alarmes automatiques
 *          - Métriques network avancées
 *          - Support --debug
 */

import { StateManager } from "/lib/state-manager.js";
import { Debug, parseDebugLevel, ICONS } from "/lib/debug.js";

// ══════════════════════════════════════════════════════════════
// CONFIGURATION
// ══════════════════════════════════════════════════════════════

const UPDATE_INTERVAL = 30000; // 30s
const ALARM_THRESHOLD_RAM_USAGE = 80; // %
const ALARM_THRESHOLD_EMPTY_ROOTED = 5; // serveurs

// ══════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════

/** @param {NS} ns */
export async function main(ns) {
    // Setup
    ns.disableLog("ALL");
    ns.tail();
    
    const debugLevel = parseDebugLevel(ns);
    const dbg = new Debug(ns, debugLevel);
    const stateMgr = new StateManager(ns, debugLevel);
    
    dbg.header("TELEMETRY DAEMON v0.1.0");
    dbg.normal("L'Œil d'OUROBOROS surveille la partie...", ICONS.EYE);
    dbg.separator();
    dbg.normal(`${ICONS.INFO} Update interval: ${UPDATE_INTERVAL/1000}s`);
    dbg.normal(`${ICONS.LOCK} Protected from global-kill`);
    dbg.separator();
    
    let cycle = 0;
    let alarmHistory = [];
    
    // ══════════════════════════════════════════════════════════════
    // MAIN LOOP
    // ══════════════════════════════════════════════════════════════
    
    while (true) {
        cycle++;
        const timestamp = new Date().toISOString();
        
        dbg.clear();
        dbg.header(`TELEMETRY DAEMON - Cycle ${cycle}`);
        dbg.normal(`${ICONS.TIMER} ${timestamp}`);
        dbg.separator();
        
        // ══════════════════════════════════════════════════════════════
        // 1️⃣ NETWORK STATUS (CRITIQUE)
        // ══════════════════════════════════════════════════════════════
        
        dbg.verbose("${ICONS.NETWORK} Collecting network status...");
        dbg.startTimer("network-scan");
        
        const networkStatus = collectNetworkStatus(ns, dbg);
        await stateMgr.save("network-status.json", networkStatus);
        
        dbg.endTimer("network-scan");
        
        dbg.normal(`${ICONS.NETWORK} Network: ${networkStatus.totalServersScanned} servers`);
        dbg.normal(`  ${ICONS.SUCCESS} Rooted: ${networkStatus.totalServersRooted}`);
        dbg.normal(`  ${ICONS.CHART} With scripts: ${networkStatus.totalServersWithScripts}`);
        dbg.normal(`  ${ICONS.WARNING} Empty (rooted): ${networkStatus.totalServersEmpty}`);
        dbg.verbose(`  ${ICONS.CHART} RAM: ${ns.formatNumber(networkStatus.totalRamUsed)}GB / ${ns.formatNumber(networkStatus.totalRamNetwork)}GB (${networkStatus.ramUsagePercent.toFixed(1)}%)`);
        
        // Alarmes network
        checkNetworkAlarms(ns, dbg, networkStatus, alarmHistory);
        
        dbg.separator();
        
        // ══════════════════════════════════════════════════════════════
        // 2️⃣ PERFORMANCE METRICS
        // ══════════════════════════════════════════════════════════════
        
        dbg.verbose(`${ICONS.SPEED} Collecting performance metrics...`);
        
        const perfMetrics = collectPerformanceMetrics(ns, dbg);
        await stateMgr.save("performance-metrics.json", perfMetrics);
        
        dbg.normal(`${ICONS.SPEED} Threads: ${ns.formatNumber(perfMetrics.totalThreads || 0)}`);
        dbg.money("Money", perfMetrics.currentMoney || 0);
        dbg.normal(`${ICONS.CHART} Revenue: $${ns.formatNumber(perfMetrics.revenuePerSecond || 0)}/s`);
        
        // Alarmes performance
        checkPerformanceAlarms(ns, dbg, perfMetrics, alarmHistory);
        
        dbg.separator();
        
        // ══════════════════════════════════════════════════════════════
        // 3️⃣ PLAYER STATS
        // ══════════════════════════════════════════════════════════════
        
        dbg.verbose(`${ICONS.TARGET} Collecting player stats...`);
        
        const playerStats = collectPlayerStats(ns, dbg);
        await stateMgr.save("player-stats.json", playerStats);
        
        dbg.normal(`${ICONS.TARGET} Hacking: ${playerStats.hackingLevel}`);
        dbg.verbose(`${ICONS.BRAIN} BitNode: ${playerStats.currentBitNode}`);
        dbg.verbose(`${ICONS.TIMER} Since aug: ${formatTime(playerStats.timeSinceLastAug)}`);
        
        dbg.separator();
        
        // ══════════════════════════════════════════════════════════════
        // 4️⃣ VERSION TRACKING
        // ══════════════════════════════════════════════════════════════
        
        dbg.verbose(`${ICONS.INFO} Tracking versions...`);
        
        const versionInfo = collectVersionInfo(ns, dbg);
        await stateMgr.save("version-tracking.json", versionInfo);
        
        if (dbg.isLevel(2)) {
            dbg.verbose(`${ICONS.INFO} Active versions:`);
            for (const [file, version] of Object.entries(versionInfo.versions)) {
                dbg.verbose(`  ${file}: v${version}`);
            }
        }
        
        dbg.separator();
        
        // ══════════════════════════════════════════════════════════════
        // 5️⃣ BATCHER DETECTION
        // ══════════════════════════════════════════════════════════════
        
        const batcherActive = detectBatcher(ns, dbg);
        
        if (batcherActive) {
            dbg.normal(`${ICONS.ROCKET} Batcher: ACTIVE`);
        } else {
            dbg.warn("Batcher: NOT DETECTED");
        }
        
        dbg.separator();
        
        // ══════════════════════════════════════════════════════════════
        // 6️⃣ HEARTBEAT
        // ══════════════════════════════════════════════════════════════
        
        await stateMgr.save("daemon-heartbeat.json", {
            timestamp: timestamp,
            cycle: cycle,
            pid: ns.pid,
            uptime: ns.getTimeSinceLastAug(),
            debugLevel: debugLevel,
            alarms: alarmHistory.slice(-10) // Last 10 alarms
        });
        
        dbg.normal(`${ICONS.SUCCESS} Heartbeat saved (cycle ${cycle})`);
        dbg.normal(`${ICONS.TIMER} Next update in ${UPDATE_INTERVAL/1000}s...`);
        
        await ns.sleep(UPDATE_INTERVAL);
    }
}

// ══════════════════════════════════════════════════════════════
// COLLECTION FUNCTIONS
// ══════════════════════════════════════════════════════════════

/**
 * Collecter status réseau complet
 * @param {NS} ns
 * @param {Debug} dbg
 * @returns {object}
 */
function collectNetworkStatus(ns, dbg) {
    // Scan complet BFS
    const visited = new Set();
    const queue = ["home"];
    const allServers = [];
    
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
        
        allServers.push(current);
    }
    
    // Analyser chaque serveur
    const serversDetail = [];
    let totalRooted = 0;
    let totalWithScripts = 0;
    let totalEmpty = 0;
    let totalRamNetwork = 0;
    let totalRamUsed = 0;
    let totalRamAvailable = 0;
    
    for (const hostname of allServers) {
        const hasRoot = ns.hasRootAccess(hostname);
        const maxRam = ns.getServerMaxRam(hostname);
        const usedRam = ns.getServerUsedRam(hostname);
        const availableRam = maxRam - usedRam;
        const processes = ns.ps(hostname);
        
        if (hasRoot) totalRooted++;
        if (processes.length > 0) totalWithScripts++;
        if (processes.length === 0 && maxRam > 0 && hasRoot) totalEmpty++;
        
        totalRamNetwork += maxRam;
        totalRamUsed += usedRam;
        totalRamAvailable += availableRam;
        
        serversDetail.push({
            hostname: hostname,
            hasRoot: hasRoot,
            maxRam: maxRam,
            usedRam: usedRam,
            availableRam: availableRam,
            processCount: processes.length,
            processes: processes.map(p => ({
                filename: p.filename,
                threads: p.threads,
                args: p.args
            }))
        });
    }
    
    return {
        timestamp: new Date().toISOString(),
        totalServersScanned: allServers.length,
        totalServersRooted: totalRooted,
        totalServersWithScripts: totalWithScripts,
        totalServersEmpty: totalEmpty,
        totalRamNetwork: totalRamNetwork,
        totalRamUsed: totalRamUsed,
        totalRamAvailable: totalRamAvailable,
        ramUsagePercent: totalRamNetwork > 0 ? (totalRamUsed / totalRamNetwork) * 100 : 0,
        serversDetail: serversDetail
    };
}

/**
 * Collecter métriques performance
 * @param {NS} ns
 * @param {Debug} dbg
 * @returns {object}
 */
function collectPerformanceMetrics(ns, dbg) {
    // Compter threads actifs
    const allServers = scanAll(ns);
    let totalThreads = 0;
    
    for (const server of allServers) {
        const processes = ns.ps(server);
        for (const proc of processes) {
            totalThreads += proc.threads;
        }
    }
    
    // Revenue (avec fallback si API indisponible)
    let revenuePerSecond = 0;
    try {
        const income = ns.getScriptIncome();
        if (income && Array.isArray(income) && income.length > 0) {
            revenuePerSecond = income[0] || 0;
        }
    } catch (e) {
        dbg.ultra(`${ICONS.WARNING} getScriptIncome not available`);
        revenuePerSecond = 0;
    }
    
    return {
        timestamp: new Date().toISOString(),
        currentMoney: ns.getServerMoneyAvailable("home"),
        revenuePerSecond: revenuePerSecond,
        totalThreads: totalThreads,
        hackingLevel: ns.getHackingLevel()
    };
}

/**
 * Collecter stats joueur
 * @param {NS} ns
 * @param {Debug} dbg
 * @returns {object}
 */
function collectPlayerStats(ns, dbg) {
    return {
        timestamp: new Date().toISOString(),
        hackingLevel: ns.getHackingLevel(),
        currentBitNode: "BN-1", // Placeholder (besoin Singularity pour détecter)
        timeSinceLastAug: ns.getTimeSinceLastAug(),
        homeRamMax: ns.getServerMaxRam("home"),
        homeRamUsed: ns.getServerUsedRam("home"),
        purchasedServers: ns.getPurchasedServers().length
    };
}

/**
 * Collecter versions fichiers
 * @param {NS} ns
 * @param {Debug} dbg
 * @returns {object}
 */
function collectVersionInfo(ns, dbg) {
    const files = [
        "/boot.js",
        "/lib/debug.js",
        "/lib/state-manager.js",
        "/tools/log-action.js",
        "/tools/telemetry-daemon.js"
    ];
    
    const versions = {};
    
    for (const file of files) {
        if (ns.fileExists(file)) {
            const content = ns.read(file);
            const match = content.match(/v([\d.]+)/);
            versions[file] = match ? match[1] : "unknown";
        } else {
            versions[file] = "missing";
        }
    }
    
    return {
        timestamp: new Date().toISOString(),
        versions: versions
    };
}

/**
 * Détecter si batcher actif
 * @param {NS} ns
 * @param {Debug} dbg
 * @returns {boolean}
 */
function detectBatcher(ns, dbg) {
    const allServers = scanAll(ns);
    
    for (const server of allServers) {
        const processes = ns.ps(server);
        for (const proc of processes) {
            // Chercher scripts avec "batch" dans le nom
            if (proc.filename.includes("batch") || 
                proc.filename.includes("orchestrat") ||
                proc.filename.includes("controller")) {
                return true;
            }
        }
    }
    
    return false;
}

// ══════════════════════════════════════════════════════════════
// ALARM FUNCTIONS
// ══════════════════════════════════════════════════════════════

/**
 * Vérifier alarmes réseau
 * @param {NS} ns
 * @param {Debug} dbg
 * @param {object} networkStatus
 * @param {Array} alarmHistory
 */
function checkNetworkAlarms(ns, dbg, networkStatus, alarmHistory) {
    // Alarme: trop de serveurs rootés vides
    if (networkStatus.totalServersEmpty > ALARM_THRESHOLD_EMPTY_ROOTED) {
        const msg = `${networkStatus.totalServersEmpty} rooted servers are EMPTY (deployment issue?)`;
        dbg.warn(msg);
        dbg.toastWarning(msg);
        alarmHistory.push({ timestamp: new Date().toISOString(), type: "EMPTY_SERVERS", message: msg });
    }
    
    // Alarme: RAM usage élevé
    if (networkStatus.ramUsagePercent > ALARM_THRESHOLD_RAM_USAGE) {
        const msg = `RAM usage at ${networkStatus.ramUsagePercent.toFixed(1)}% (high)`;
        dbg.warn(msg);
        alarmHistory.push({ timestamp: new Date().toISOString(), type: "HIGH_RAM", message: msg });
    }
}

/**
 * Vérifier alarmes performance
 * @param {NS} ns
 * @param {Debug} dbg
 * @param {object} perfMetrics
 * @param {Array} alarmHistory
 */
function checkPerformanceAlarms(ns, dbg, perfMetrics, alarmHistory) {
    // Alarme: threads actifs mais revenue = 0
    if (perfMetrics.totalThreads > 0 && perfMetrics.revenuePerSecond === 0) {
        const msg = `${perfMetrics.totalThreads} threads active but $0/s revenue (stuck?)`;
        dbg.warn(msg);
        alarmHistory.push({ timestamp: new Date().toISOString(), type: "ZERO_REVENUE", message: msg });
    }
}

// ══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════════

/**
 * Scan tous les serveurs (BFS)
 * @param {NS} ns
 * @returns {Array<string>}
 */
function scanAll(ns) {
    const visited = new Set();
    const queue = ["home"];
    const servers = [];
    
    while (queue.length > 0) {
        const current = queue.shift();
        if (visited.has(current)) continue;
        visited.add(current);
        
        const neighbors = ns.scan(current);
        for (const n of neighbors) {
            if (!visited.has(n)) queue.push(n);
        }
        
        servers.push(current);
    }
    
    return servers;
}

/**
 * Formater temps ms en human-readable
 * @param {number} ms
 * @returns {string}
 */
function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}
