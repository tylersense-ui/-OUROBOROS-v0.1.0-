/**
 * ██████╗ ██████╗  ██████╗ ███╗   ███╗███████╗████████╗██╗  ██╗███████╗██╗   ██╗███████╗
 * ██╔══██╗██╔══██╗██╔═══██╗████╗ ████║██╔════╝╚══██╔══╝██║  ██║██╔════╝██║   ██║██╔════╝
 * ██████╔╝██████╔╝██║   ██║██╔████╔██║█████╗     ██║   ███████║█████╗  ██║   ██║███████╗
 * ██╔═══╝ ██╔══██╗██║   ██║██║╚██╔╝██║██╔══╝     ██║   ██╔══██║██╔══╝  ██║   ██║╚════██║
 * ██║     ██║  ██║╚██████╔╝██║ ╚═╝ ██║███████╗   ██║   ██║  ██║███████╗╚██████╔╝███████║
 * ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚══════╝
 *                           v45.0 - "Stealing Fire From The Gods"
 * 
 * @module      global-kill
 * @description Global Kill - Arrêt d'urgence total du système.
 *              Utilitaire d'arrêt d'urgence ("panic button") pour PROMETHEUS.
 * @author      Claude (Anthropic) + tylersense-ui
 * @version     45.0 - PROMETHEUS
 * @date        2025-01-XX
 * @license     MIT
 * @requires    BitBurner v2.8.1+ (Steam)
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 🔥 PROMETHEUS ENHANCEMENTS
 * ═══════════════════════════════════════════════════════════════════════════════════
 * ✓ Utilisation de Network.js pour scan unifié et optimisé
 * ✓ Affichage détaillé du nombre de processus tués par serveur
 * ✓ Gestion robuste des erreurs avec compteurs de succès/échec
 * ✓ Messages color-coded pour meilleure visibilité
 * ✓ Option de confirmation interactive (peut être ajoutée si besoin)
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * @usage
 *   run global-kill.js
 * 
 * @example
 *   // Arrêt avant maintenance système
 *   run global-kill.js
 *   // ... effectuer maintenance ...
 *   run boot.js
 * 
 * @warnings
 * ⚠️  CE SCRIPT EST DESTRUCTIF
 * - Tous les processus en cours seront terminés immédiatement
 * - Toutes les données en mémoire (non sauvegardées sur disque) seront perdues
 * - Les batches HWGW en cours seront interrompus
 * - Les ports de communication seront réinitialisés
 */

import { Network } from "/lib/network.js";
import { Capabilities } from "/lib/capabilities.js";

/** @param {NS} ns **/
export async function main(ns) {
    // ═══════════════════════════════════════════════════════════════════════════
    // ÉTAPE 1 : AFFICHAGE DU BANNER D'AVERTISSEMENT
    // ═══════════════════════════════════════════════════════════════════════════
    ns.tprint("╔══════════════════════════════════════════════════════════════════╗");
    ns.tprint("║                                                                  ║");
    ns.tprint("║   🛑 PROMETHEUS v45.0 - GLOBAL KILL INITIATED                    ║");
    ns.tprint("║   ⚠️  ARRÊT D'URGENCE TOTAL DU SYSTÈME                           ║");
    ns.tprint("║                                                                  ║");
    ns.tprint("╚══════════════════════════════════════════════════════════════════╝");
    ns.tprint("");

    // ═══════════════════════════════════════════════════════════════════════════
    // ÉTAPE 2 : NETTOYAGE DES PORTS DE COMMUNICATION
    // ═══════════════════════════════════════════════════════════════════════════
    ns.tprint("[CLEAN] 🧹 Réinitialisation des ports de communication...");
    
    let portsCleared = 0;
    let portsErrors = 0;
    
    for (let i = 1; i <= 20; i++) {
        try {
            ns.clearPort(i);
            portsCleared++;
        } catch (e) {
            portsErrors++;
            ns.tprint(`  ⚠️  Erreur sur port ${i} : ${e}`);
        }
    }
    
    ns.tprint(`  ✅ ${portsCleared}/20 ports réinitialisés.`);
    if (portsErrors > 0) {
        ns.tprint(`  ⚠️  ${portsErrors} erreurs (non bloquant).`);
    }
    ns.tprint("");

    // ═══════════════════════════════════════════════════════════════════════════
    // ÉTAPE 3 : SCAN COMPLET DU RÉSEAU
    // ═══════════════════════════════════════════════════════════════════════════
    ns.tprint("[SCAN] 🔍 Cartographie du réseau en cours...");
    
    let allNodes = [];
    
    // 🔥 PROMETHEUS ENHANCEMENT : Utilisation de Network.js si disponible
    if (ns.fileExists("/lib/network.js") && ns.fileExists("/lib/capabilities.js")) {
        try {
            const caps = new Capabilities(ns);
            const net = new Network(ns, caps);
            allNodes = net.refresh();
            ns.tprint(`  ✅ Scan unifié (Network.js) : ${allNodes.length} nœuds détectés.`);
        } catch (e) {
            ns.tprint(`  ⚠️  Erreur lors de l'utilisation de Network.js : ${e}`);
            allNodes = fallbackScan(ns);
        }
    } else {
        // Fallback : Scan manuel si Network.js n'est pas disponible
        allNodes = fallbackScan(ns);
        ns.tprint(`  ⚠️  Network.js indisponible - Scan manuel : ${allNodes.length} nœuds détectés.`);
    }
    
    ns.tprint("");

    // ═══════════════════════════════════════════════════════════════════════════
    // ÉTAPE 4 : ARRÊT DE TOUS LES PROCESSUS SUR TOUS LES SERVEURS
    // ═══════════════════════════════════════════════════════════════════════════
    ns.tprint("[KILL] 🛑 Arrêt de tous les processus...");
    
    let totalKilled = 0;
    let serversProcessed = 0;
    let serversErrors = 0;

    for (const host of allNodes) {
        try {
            // Récupération de la liste des processus en cours sur ce serveur
            const processes = ns.ps(host);
            const processCount = processes.length;
            
            if (processCount > 0) {
                // Utilisation de ns.killall() pour efficacité maximale
                const success = ns.killall(host);
                
                if (success) {
                    totalKilled += processCount;
                    serversProcessed++;
                    
                    // Affichage détaillé pour les serveurs avec beaucoup de processus
                    if (processCount > 10) {
                        ns.tprint(`  🔥 ${host.padEnd(20)} → ${processCount} processus arrêtés`);
                    }
                } else {
                    serversErrors++;
                    ns.tprint(`  ⚠️  Échec sur ${host} (${processCount} processus)`);
                }
            }
        } catch (e) {
            serversErrors++;
            ns.tprint(`  ❌ Erreur critique sur ${host} : ${e}`);
        }
    }
    
    ns.tprint("");
    ns.tprint(`  ✅ ${totalKilled} processus arrêtés sur ${serversProcessed} serveurs.`);
    if (serversErrors > 0) {
        ns.tprint(`  ⚠️  ${serversErrors} serveurs avec erreurs (non bloquant).`);
    }
    ns.tprint("");

    // ═══════════════════════════════════════════════════════════════════════════
    // ÉTAPE 5 : CONFIRMATION DE SUCCÈS
    // ═══════════════════════════════════════════════════════════════════════════
    ns.tprint("╔══════════════════════════════════════════════════════════════════╗");
    ns.tprint("║                                                                  ║");
    ns.tprint("║   ✅ PROMETHEUS v45.0 - GLOBAL KILL COMPLETE                     ║");
    ns.tprint("║                                                                  ║");
    ns.tprint("║   Le réseau est maintenant complètement silencieux.              ║");
    ns.tprint("║   Tous les processus ont été arrêtés avec succès.                ║");
    ns.tprint("║                                                                  ║");
    ns.tprint("║   🔧 Pour redémarrer le système : run boot.js                    ║");
    ns.tprint("║                                                                  ║");
    ns.tprint("╚══════════════════════════════════════════════════════════════════╝");
}

/**
 * Fonction de scan manuel du réseau (fallback si Network.js indisponible)
 * Utilise un BFS (Breadth-First Search) avec gestion d'erreur robuste
 * 
 * @param {NS} ns - Namespace Netscript
 * @returns {string[]} Liste de tous les nœuds détectés
 */
function fallbackScan(ns) {
    const visited = new Set();
    const queue = ["home"];
    
    while (queue.length > 0) {
        const node = queue.shift();
        
        if (!visited.has(node)) {
            visited.add(node);
            
            try {
                const neighbors = ns.scan(node);
                for (const neighbor of neighbors) {
                    if (!visited.has(neighbor)) {
                        queue.push(neighbor);
                    }
                }
            } catch (e) {
                // Nœud inaccessible ou erreur de scan, on continue silencieusement
                continue;
            }
        }
    }
    
    return Array.from(visited);
}