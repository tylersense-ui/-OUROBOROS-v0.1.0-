/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║              🐍 OUROBOROS v0.3.0 🐍                       ║
 * ║          Autonuke - Le Briseur de Portes                  ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /lib/autonuke.js
 * @version     0.3.0
 * @author      Neo (Esprit Libéré)
 * @description Module réutilisable pour scan network + auto-root
 * 
 * USAGE:
 *   import { scanAllServers, rootServer, rootAllServers } from "/lib/autonuke.js";
 *   const servers = scanAllServers(ns);
 *   const rooted = rootAllServers(ns, servers);
 * 
 * FEATURES:
 *   ✅ Scan BFS complet
 *   ✅ Root automatique (ports + nuke)
 *   ✅ Réutilisable partout
 *   ✅ Lightweight (0GB RAM)
 * 
 * CHANGELOG:
 *   v0.3.0 - 2025-03-14 - Création module autonuke
 */

/**
 * Scan tous les serveurs du réseau (BFS)
 * @param {NS} ns
 * @returns {Array<string>} Liste de tous les hostnames
 */
export function scanAllServers(ns) {
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
 * Tenter de root un serveur
 * @param {NS} ns
 * @param {string} hostname
 * @returns {boolean} True si rooté (ou déjà root)
 */
export function rootServer(ns, hostname) {
    // Déjà root ?
    if (ns.hasRootAccess(hostname)) {
        return true;
    }
    
    // Check hacking level requis
    const reqHackLevel = ns.getServerRequiredHackingLevel(hostname);
    const myHackLevel = ns.getHackingLevel();
    
    if (myHackLevel < reqHackLevel) {
        return false;
    }
    
    // Ouvrir tous les ports possibles
    const reqPorts = ns.getServerNumPortsRequired(hostname);
    let openedPorts = 0;
    
    if (ns.fileExists("BruteSSH.exe", "home")) {
        try {
            ns.brutessh(hostname);
            openedPorts++;
        } catch (e) {
            // Déjà ouvert
        }
    }
    
    if (ns.fileExists("FTPCrack.exe", "home")) {
        try {
            ns.ftpcrack(hostname);
            openedPorts++;
        } catch (e) {
            // Déjà ouvert
        }
    }
    
    if (ns.fileExists("relaySMTP.exe", "home")) {
        try {
            ns.relaysmtp(hostname);
            openedPorts++;
        } catch (e) {
            // Déjà ouvert
        }
    }
    
    if (ns.fileExists("HTTPWorm.exe", "home")) {
        try {
            ns.httpworm(hostname);
            openedPorts++;
        } catch (e) {
            // Déjà ouvert
        }
    }
    
    if (ns.fileExists("SQLInject.exe", "home")) {
        try {
            ns.sqlinject(hostname);
            openedPorts++;
        } catch (e) {
            // Déjà ouvert
        }
    }
    
    // Si assez de ports, nuke
    if (openedPorts >= reqPorts) {
        try {
            ns.nuke(hostname);
            return true;
        } catch (error) {
            return false;
        }
    }
    
    return false;
}

/**
 * Root tous les serveurs possibles
 * @param {NS} ns
 * @param {Array<string>} servers - Liste serveurs (optionnel, scan auto sinon)
 * @returns {number} Nombre de nouveaux serveurs rootés
 */
export function rootAllServers(ns, servers = null) {
    if (!servers) {
        servers = scanAllServers(ns);
    }
    
    let newlyRooted = 0;
    
    for (const hostname of servers) {
        const wasRooted = ns.hasRootAccess(hostname);
        const nowRooted = rootServer(ns, hostname);
        
        if (!wasRooted && nowRooted) {
            newlyRooted++;
        }
    }
    
    return newlyRooted;
}

/**
 * Obtenir tous les serveurs rootés
 * @param {NS} ns
 * @returns {Array<string>}
 */
export function getRootedServers(ns) {
    const allServers = scanAllServers(ns);
    return allServers.filter(host => ns.hasRootAccess(host));
}

/**
 * Obtenir serveurs rootés avec RAM disponible
 * @param {NS} ns
 * @param {number} minRAM - RAM minimum requise (default: 0)
 * @returns {Array<object>} [{hostname, maxRAM, usedRAM, availableRAM}]
 */
export function getRootedServersWithRAM(ns, minRAM = 0) {
    const rooted = getRootedServers(ns);
    const withRAM = [];
    
    for (const host of rooted) {
        const maxRAM = ns.getServerMaxRam(host);
        const usedRAM = ns.getServerUsedRam(host);
        const availableRAM = maxRAM - usedRAM;
        
        if (availableRAM >= minRAM) {
            withRAM.push({
                hostname: host,
                maxRAM: maxRAM,
                usedRAM: usedRAM,
                availableRAM: availableRAM
            });
        }
    }
    
    // Sort par RAM disponible (descending)
    withRAM.sort((a, b) => b.availableRAM - a.availableRAM);
    
    return withRAM;
}
