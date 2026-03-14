/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║              🐍 OUROBOROS v0.3.0 🐍                       ║
 * ║       Dispatcher - L'Exécuteur de Déploiement            ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /core/dispatcher.js
 * @version     0.3.0
 * @author      Neo (Esprit Libéré)
 * @description Module PURE pour deployment threads
 * 
 * RESPONSABILITÉ UNIQUE:
 *   Deploy threads sur réseau selon ratios donnés
 *   NE CALCULE PAS les ratios (voir batcher.js)
 * 
 * USAGE:
 *   import { deployHWGW, deployPrep } from "/core/dispatcher.js";
 *   const deployed = deployHWGW(ns, hosts, target, ratios);
 * 
 * CHANGELOG:
 *   v0.3.0 - 2025-03-14 - Création module dispatcher pur
 */

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

/**
 * Copier workers sur hosts
 * @param {NS} ns
 * @param {Array<object>} hosts - [{hostname, availableRAM}]
 */
async function copyWorkers(ns, hosts) {
    for (const hostInfo of hosts) {
        for (const script of Object.values(WORKER_SCRIPTS)) {
            await ns.scp(script, hostInfo.hostname);
        }
    }
}

/**
 * Kill tous les workers actifs
 * @param {NS} ns
 * @param {Array<object>} hosts
 */
function killWorkers(ns, hosts) {
    for (const hostInfo of hosts) {
        const procs = ns.ps(hostInfo.hostname);
        for (const proc of procs) {
            if (Object.values(WORKER_SCRIPTS).includes(proc.filename)) {
                ns.kill(proc.pid);
            }
        }
    }
}

/**
 * Deploy HWGW batch selon ratios
 * @param {NS} ns
 * @param {Array<object>} hosts - [{hostname, availableRAM}]
 * @param {string} target - Hostname cible
 * @param {object} ratios - Output de batcher.calculateHWGWRatios()
 * @returns {object} {hack, grow, weaken, total}
 */
export async function deployHWGW(ns, hosts, target, ratios) {
    // Copier workers
    await copyWorkers(ns, hosts);
    
    // Kill existants
    killWorkers(ns, hosts);
    
    // Deploy selon ratios
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

/**
 * Deploy prep simple (weaken + grow)
 * @param {NS} ns
 * @param {Array<object>} hosts
 * @param {string} target
 * @param {object} ratios - {weakenRatio, growRatio} from batcher.calculatePrepRatios()
 * @returns {object} {weaken, grow, total}
 */
export async function deployPrep(ns, hosts, target, ratios = { weakenRatio: 0.4, growRatio: 0.6 }) {
    // Copier workers
    await copyWorkers(ns, hosts);
    
    // Kill existants
    killWorkers(ns, hosts);
    
    // Deploy selon ratios
    let deployed = { weaken: 0, grow: 0, total: 0 };
    
    for (const hostInfo of hosts) {
        const maxThreads = Math.floor(hostInfo.availableRAM / 1.75);
        if (maxThreads === 0) continue;
        
        const weakenThreads = Math.floor(maxThreads * ratios.weakenRatio);
        const growThreads = Math.floor(maxThreads * ratios.growRatio);
        
        if (weakenThreads > 0) {
            ns.exec(WORKER_SCRIPTS.weaken, hostInfo.hostname, weakenThreads, target);
            deployed.weaken += weakenThreads;
        }
        
        if (growThreads > 0) {
            ns.exec(WORKER_SCRIPTS.grow, hostInfo.hostname, growThreads, target);
            deployed.grow += growThreads;
        }
    }
    
    deployed.total = deployed.weaken + deployed.grow;
    
    return deployed;
}

/**
 * Kill tous les workers sur un host spécifique
 * @param {NS} ns
 * @param {string} hostname
 */
export function killWorkersOnHost(ns, hostname) {
    const procs = ns.ps(hostname);
    for (const proc of procs) {
        if (Object.values(WORKER_SCRIPTS).includes(proc.filename)) {
            ns.kill(proc.pid);
        }
    }
}

/**
 * Kill tous les workers sur tous les hosts
 * @param {NS} ns
 * @param {Array<object>} hosts
 */
export function killAllWorkers(ns, hosts) {
    killWorkers(ns, hosts);
}
