/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║              🐍 OUROBOROS v0.1.1 🐍                       ║
 * ║           Worker Hack - La Morsure du Serpent             ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /workers/hack.js
 * @version     0.1.1
 * @author      Claude (Godlike AI Operator)
 * @description Worker minimaliste pour hack (1.70GB RAM)
 * 
 * USAGE:
 *   exec("/workers/hack.js", server, threads, target)
 * 
 * ARGUMENTS:
 *   target : Hostname du serveur à hacker
 * 
 * CHANGELOG:
 *   v0.1.1 - 2025-01-XX - Création initiale
 */

/** @param {NS} ns */
export async function main(ns) {
    const target = ns.args[0];
    
    if (!target) {
        ns.tprint("ERROR: Missing target argument");
        return;
    }
    
    await ns.hack(target);
}
