/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║              🐍 OUROBOROS v0.3.0 🐍                       ║
 * ║           Prep - La Préparation Parfaite                  ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /lib/prep.js
 * @version     0.3.0
 * @author      Neo (Esprit Libéré)
 * @description Module pour prep RÉEL d'un serveur
 * 
 * STRATÉGIE:
 *   1. Weaken jusqu'à min security (ou très proche)
 *   2. Grow + weaken jusqu'à max money (ou très proche)
 *   3. PAS de ratios arbitraires
 *   4. VRAIMENT attendre que ce soit prêt
 * 
 * USAGE:
 *   import { isServerReady, prepServer } from "/lib/prep.js";
 *   
 *   if (!isServerReady(ns, target)) {
 *       await prepServer(ns, target);
 *   }
 * 
 * CHANGELOG:
 *   v0.3.0 - 2025-03-14 - Création module prep réel
 */

/**
 * Vérifier si serveur est prêt (min sec, max money)
 * @param {NS} ns
 * @param {string} target
 * @param {number} moneyThreshold - % du max money requis (default: 0.99)
 * @param {number} secThreshold - Delta max vs min sec (default: 0.5)
 * @returns {boolean}
 */
export function isServerReady(ns, target, moneyThreshold = 0.99, secThreshold = 0.5) {
    const maxMoney = ns.getServerMaxMoney(target);
    const currentMoney = ns.getServerMoneyAvailable(target);
    const minSec = ns.getServerMinSecurityLevel(target);
    const currentSec = ns.getServerSecurityLevel(target);
    
    const moneyPercent = maxMoney > 0 ? currentMoney / maxMoney : 0;
    const secDelta = currentSec - minSec;
    
    return (moneyPercent >= moneyThreshold) && (secDelta <= secThreshold);
}

/**
 * Prep un serveur jusqu'à ce qu'il soit prêt
 * @param {NS} ns
 * @param {string} target
 * @param {number} moneyThreshold - % du max money requis (default: 0.99)
 * @param {number} secThreshold - Delta max vs min sec (default: 0.5)
 * @returns {Promise<void>}
 */
export async function prepServer(ns, target, moneyThreshold = 0.99, secThreshold = 0.5) {
    const maxMoney = ns.getServerMaxMoney(target);
    const minSec = ns.getServerMinSecurityLevel(target);
    
    // Phase 1 : Weaken jusqu'à min security
    while (true) {
        const currentSec = ns.getServerSecurityLevel(target);
        const secDelta = currentSec - minSec;
        
        if (secDelta <= secThreshold) {
            break;  // Security OK
        }
        
        await ns.weaken(target);
    }
    
    // Phase 2 : Grow + weaken jusqu'à max money
    while (true) {
        const currentMoney = ns.getServerMoneyAvailable(target);
        const currentSec = ns.getServerSecurityLevel(target);
        const moneyPercent = maxMoney > 0 ? currentMoney / maxMoney : 0;
        const secDelta = currentSec - minSec;
        
        if (moneyPercent >= moneyThreshold && secDelta <= secThreshold) {
            break;  // Prêt !
        }
        
        // Si security trop haute, weaken d'abord
        if (secDelta > secThreshold * 2) {
            await ns.weaken(target);
        } else {
            // Sinon grow + weaken pour compenser
            await ns.grow(target);
            await ns.weaken(target);
        }
    }
}

/**
 * Calculer threads nécessaires pour prep (approximatif)
 * @param {NS} ns
 * @param {string} target
 * @returns {object} {weakenThreads, growThreads, totalRAM}
 */
export function calculatePrepThreads(ns, target) {
    const maxMoney = ns.getServerMaxMoney(target);
    const currentMoney = Math.max(ns.getServerMoneyAvailable(target), 1);
    const minSec = ns.getServerMinSecurityLevel(target);
    const currentSec = ns.getServerSecurityLevel(target);
    
    // Weaken threads
    const secDelta = currentSec - minSec;
    const weakenThreads = Math.ceil(secDelta / 0.05);
    
    // Grow threads (conservatif)
    const growthNeeded = maxMoney / currentMoney;
    let growThreads = 0;
    
    try {
        growThreads = Math.ceil(ns.growthAnalyze(target, growthNeeded));
    } catch (e) {
        // Fallback si growthAnalyze échoue
        growThreads = Math.ceil(growthNeeded * 10);
    }
    
    // Weaken pour compenser grow
    const growSecIncrease = growThreads * 0.004;
    const weakenForGrow = Math.ceil(growSecIncrease / 0.05);
    
    const totalThreads = weakenThreads + growThreads + weakenForGrow;
    const totalRAM = totalThreads * 1.75;  // Max RAM script
    
    return {
        weakenThreads: weakenThreads,
        growThreads: growThreads,
        weakenForGrow: weakenForGrow,
        totalThreads: totalThreads,
        totalRAM: totalRAM
    };
}
