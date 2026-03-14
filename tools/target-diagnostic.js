/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║              🐍 OUROBOROS v0.1.0 🐍                       ║
 * ║        Target Diagnostic - Analyse État Target            ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /tools/target-diagnostic.js
 * @version     0.1.0
 * @author      Claude (Godlike AI Operator)
 * @description Diagnostic détaillé d'un target
 * 
 * USAGE:
 *   run /tools/target-diagnostic.js foodnstuff
 * 
 * FEATURES:
 *   🔍 Analyse complète target
 *   📊 Money status (current vs max)
 *   🔒 Security status (current vs min)
 *   🎯 Hack chance & time
 *   🧠 Action decision recommendation
 * 
 * CHANGELOG:
 *   v0.1.0 - 2025-01-XX - Création initiale pour debug
 */

/** @param {NS} ns */
export async function main(ns) {
    const target = ns.args[0] || "foodnstuff";
    
    ns.tprint("═══════════════════════════════════════════════════════════");
    ns.tprint(`🎯 TARGET DIAGNOSTIC: ${target}`);
    ns.tprint("═══════════════════════════════════════════════════════════");
    ns.tprint("");
    
    // Money
    const maxMoney = ns.getServerMaxMoney(target);
    const currentMoney = ns.getServerMoneyAvailable(target);
    const moneyPercent = maxMoney > 0 ? (currentMoney / maxMoney) * 100 : 0;
    
    ns.tprint(`💰 MONEY:`);
    ns.tprint(`   Max:     $${ns.formatNumber(maxMoney)}`);
    ns.tprint(`   Current: $${ns.formatNumber(currentMoney)} (${moneyPercent.toFixed(2)}%)`);
    ns.tprint("");
    
    // Security
    const minSecurity = ns.getServerMinSecurityLevel(target);
    const currentSecurity = ns.getServerSecurityLevel(target);
    const securityDelta = currentSecurity - minSecurity;
    
    ns.tprint(`🔒 SECURITY:`);
    ns.tprint(`   Min:     ${minSecurity.toFixed(2)}`);
    ns.tprint(`   Current: ${currentSecurity.toFixed(2)} (Δ ${securityDelta.toFixed(2)})`);
    ns.tprint("");
    
    // Hack info
    const hackChance = ns.hackAnalyzeChance(target);
    const hackTime = ns.getHackTime(target);
    const growTime = ns.getGrowTime(target);
    const weakenTime = ns.getWeakenTime(target);
    
    ns.tprint(`🎯 HACK INFO:`);
    ns.tprint(`   Chance:      ${(hackChance * 100).toFixed(2)}%`);
    ns.tprint(`   Hack time:   ${(hackTime / 1000).toFixed(2)}s`);
    ns.tprint(`   Grow time:   ${(growTime / 1000).toFixed(2)}s`);
    ns.tprint(`   Weaken time: ${(weakenTime / 1000).toFixed(2)}s`);
    ns.tprint("");
    
    // Decision logic (same as early-creeper)
    const SECURITY_THRESHOLD = 5;
    const MONEY_THRESHOLD = 0.75;
    
    ns.tprint(`🧠 DECISION LOGIC:`);
    ns.tprint(`   Security threshold: ${SECURITY_THRESHOLD} (current delta: ${securityDelta.toFixed(2)})`);
    ns.tprint(`   Money threshold:    ${MONEY_THRESHOLD * 100}% (current: ${moneyPercent.toFixed(2)}%)`);
    ns.tprint("");
    
    // Determine action
    let action;
    let reason;
    
    if (securityDelta > SECURITY_THRESHOLD) {
        action = "WEAKEN";
        reason = `Security too high (${securityDelta.toFixed(2)} > ${SECURITY_THRESHOLD})`;
    } else if (moneyPercent < MONEY_THRESHOLD * 100) {
        action = "GROW";
        reason = `Money too low (${moneyPercent.toFixed(2)}% < ${MONEY_THRESHOLD * 100}%)`;
    } else {
        action = "HACK";
        reason = "Optimal conditions met";
    }
    
    ns.tprint(`✅ RECOMMENDED ACTION: ${action}`);
    ns.tprint(`   Reason: ${reason}`);
    ns.tprint("");
    ns.tprint("═══════════════════════════════════════════════════════════");
}
