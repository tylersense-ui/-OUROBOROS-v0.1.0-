/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║              🐍 OUROBOROS v0.2.0 🐍                       ║
 * ║        Deploy Script - Déploiement Automatique            ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        deploy-ouroboros-v0.2.0.js
 * @version     0.2.0
 * @author      Claude (Godlike AI Operator)
 * @description Déploie OUROBOROS v0.2.0 depuis GitHub vers Bitburner
 * 
 * USAGE:
 *   1. wget https://raw.githubusercontent.com/tylersense-ui/-OUROBOROS-v0.1.0-/main/deploy-ouroboros-v0.2.0.js deploy.js
 *   2. run deploy.js
 * 
 * ACTIONS:
 *   ✅ Crée structure dossiers
 *   ✅ Télécharge tous les fichiers v0.2.0
 *   ✅ Vérifie intégrité
 *   ✅ Rapport détaillé
 * 
 * CHANGELOG:
 *   v0.2.0 - 2025-01-XX - HWGW Batching update
 *          - Ajout prep-module.js
 *          - Ajout simple-batcher.js
 *          - Update manifest + CHANGELOG
 *   v0.1.1 - 2025-01-XX - Ajout workers/, core/, CHANGELOG
 *   v0.1.0 - 2025-01-XX - Création initiale
 */

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.ui.openTail();
    
    // ══════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ══════════════════════════════════════════════════════════════
    
    const GITHUB_USER = "tylersense-ui";
    const REPO_NAME = "-OUROBOROS-v0.1.0-";
    const BRANCH = "main";
    const BASE_URL = `https://raw.githubusercontent.com/${GITHUB_USER}/${REPO_NAME}/${BRANCH}`;
    
    // Liste des fichiers à télécharger (v0.2.0)
    const FILES = [
        // Deploy
        { path: "/deploy-ouroboros.js", required: true },
        // Libraries
        { path: "/lib/debug.js", required: true },
        { path: "/lib/state-manager.js", required: true },
        { path: "/lib/prep-module.js", required: true }, // 🆕 v0.2.0
        
        // Workers
        { path: "/workers/hack.js", required: true },
        { path: "/workers/grow.js", required: true },
        { path: "/workers/weaken.js", required: true },
        
        // Core
        { path: "/core/early-creeper.js", required: false },
        { path: "/core/simple-batcher.js", required: true }, // 🆕 v0.2.0
        
        // Managers
        { path: "/managers/server-manager.js", required: false },
        
        // Tools
        { path: "/tools/log-action.js", required: false },
        { path: "/tools/telemetry-daemon.js", required: false },
        { path: "/tools/blackbox.js", required: false },
        { path: "/tools/target-diagnostic.js", required: false },
        
        // Documentation
        { path: "/manifest.json", required: false },
        { path: "/CHANGELOG.md", required: false },
        { path: "/README.md", required: false }
    ];
    
    // ══════════════════════════════════════════════════════════════
    // HEADER
    // ══════════════════════════════════════════════════════════════
    
    ns.print("╔═══════════════════════════════════════════════════════════╗");
    ns.print("║              🐍 OUROBOROS v0.2.0 🐍                       ║");
    ns.print("║            Déploiement Automatique                        ║");
    ns.print("║         HWGW BATCHING - LE SERPENT FRAPPE !              ║");
    ns.print("╚═══════════════════════════════════════════════════════════╝");
    ns.print("");
    ns.print(`📡 Repository: ${GITHUB_USER}/${REPO_NAME}`);
    ns.print(`🌿 Branch: ${BRANCH}`);
    ns.print(`📦 Files to deploy: ${FILES.length}`);
    ns.print("");
    
    await ns.sleep(1000);
    
    // ══════════════════════════════════════════════════════════════
    // ÉTAPE 1 : CRÉER STRUCTURE DOSSIERS
    // ══════════════════════════════════════════════════════════════
    
    ns.print("═════════════════════════════════════════════════════════════");
    ns.print("📁 ÉTAPE 1 : Création structure dossiers");
    ns.print("═════════════════════════════════════════════════════════════");
    ns.print("");
    
    const DIRS = ["/lib", "/core", "/workers", "/managers", "/state", "/tools"];
    
    for (const dir of DIRS) {
        try {
            await ns.write(`${dir}/.keep`, "", "w");
            ns.print(`✅ ${dir}/`);
        } catch (error) {
            ns.print(`⚠️  ${dir}/ (already exists or error)`);
        }
    }
    
    ns.print("");
    await ns.sleep(500);
    
    // ══════════════════════════════════════════════════════════════
    // ÉTAPE 2 : TÉLÉCHARGER FICHIERS
    // ══════════════════════════════════════════════════════════════
    
    ns.print("═════════════════════════════════════════════════════════════");
    ns.print("⬇️  ÉTAPE 2 : Téléchargement fichiers depuis GitHub");
    ns.print("═════════════════════════════════════════════════════════════");
    ns.print("");
    
    let successCount = 0;
    let failedCount = 0;
    const failedFiles = [];
    
    for (const file of FILES) {
        const url = BASE_URL + file.path;
        const localPath = file.path;
        
        ns.print(`⬇️  ${localPath}...`);
        
        try {
            const success = await ns.wget(url, localPath);
            
            if (success) {
                ns.print(`   ✅ Downloaded`);
                successCount++;
            } else {
                ns.print(`   ❌ FAILED`);
                failedCount++;
                failedFiles.push(file.path);
                
                if (file.required) {
                    ns.print(`   ⚠️  WARNING: This is a REQUIRED file!`);
                }
            }
        } catch (error) {
            ns.print(`   ❌ ERROR: ${error}`);
            failedCount++;
            failedFiles.push(file.path);
        }
        
        await ns.sleep(200);
    }
    
    ns.print("");
    await ns.sleep(500);
    
    // ══════════════════════════════════════════════════════════════
    // ÉTAPE 3 : VÉRIFICATION
    // ══════════════════════════════════════════════════════════════
    
    ns.print("═════════════════════════════════════════════════════════════");
    ns.print("🔍 ÉTAPE 3 : Vérification intégrité");
    ns.print("═════════════════════════════════════════════════════════════");
    ns.print("");
    
    let verifiedCount = 0;
    
    for (const file of FILES) {
        if (ns.fileExists(file.path)) {
            ns.print(`✅ ${file.path}`);
            verifiedCount++;
        } else {
            ns.print(`❌ ${file.path} (NOT FOUND)`);
        }
    }
    
    ns.print("");
    await ns.sleep(500);
    
    // ══════════════════════════════════════════════════════════════
    // RAPPORT FINAL
    // ══════════════════════════════════════════════════════════════
    
    ns.print("═════════════════════════════════════════════════════════════");
    ns.print("📊 RAPPORT DE DÉPLOIEMENT");
    ns.print("═════════════════════════════════════════════════════════════");
    ns.print("");
    ns.print(`📦 Total files: ${FILES.length}`);
    ns.print(`✅ Downloaded: ${successCount}`);
    ns.print(`🔍 Verified: ${verifiedCount}`);
    ns.print(`❌ Failed: ${failedCount}`);
    ns.print("");
    
    if (failedCount > 0) {
        ns.print("⚠️  FAILED FILES:");
        for (const path of failedFiles) {
            ns.print(`   - ${path}`);
        }
        ns.print("");
    }
    
    // ══════════════════════════════════════════════════════════════
    // STATUS FINAL
    // ══════════════════════════════════════════════════════════════
    
    if (failedCount === 0) {
        ns.print("╔═══════════════════════════════════════════════════════════╗");
        ns.print("║  🎉 DÉPLOIEMENT RÉUSSI !                                  ║");
        ns.print("║  🐍 OUROBOROS v0.2.0 - LE SERPENT FRAPPE !               ║");
        ns.print("╚═══════════════════════════════════════════════════════════╝");
        ns.print("");
        ns.print("🚀 PROCHAINES ÉTAPES:");
        ns.print("");
        ns.print("1️⃣  Kill early-creeper (si actif):");
        ns.print("   kill early-creeper.js");
        ns.print("");
        ns.print("2️⃣  Lancer Simple Batcher (HWGW):");
        ns.print("   run /core/simple-batcher.js --debug 2");
        ns.print("");
        ns.print("3️⃣  Observer le $ monter ! 💰");
        ns.print("   Revenue attendu: $0/s → $10k-50k/s");
        ns.print("");
        ns.print("4️⃣  Logger le succès:");
        ns.print('   run /tools/log-action.js "HWGW batching v0.2.0 déployé !"');
        ns.print("");
        ns.print("📊 NOUVEAUTÉS v0.2.0:");
        ns.print("   🆕 prep-module.js - Prep parallèle réutilisable");
        ns.print("   🆕 simple-batcher.js - Orchestrateur HWGW");
        ns.print("   ⚡ Revenue: $0/s → $$$$/s");
        ns.print("   🎯 Hack 5% par batch avec padding 10x");
        ns.print("");
        
        ns.toast("🐍 OUROBOROS v0.2.0 déployé avec succès !", "success", 5000);
        
    } else {
        ns.print("╔═══════════════════════════════════════════════════════════╗");
        ns.print("║  ⚠️  DÉPLOIEMENT INCOMPLET                                ║");
        ns.print("║  Certains fichiers n'ont pas pu être téléchargés         ║");
        ns.print("╚═══════════════════════════════════════════════════════════╝");
        ns.print("");
        ns.print("🔧 SOLUTIONS:");
        ns.print("");
        ns.print("1. Vérifier que le repository GitHub est public");
        ns.print("2. Vérifier l'URL dans le script (GITHUB_USER/REPO_NAME)");
        ns.print("3. Télécharger manuellement les fichiers manquants");
        ns.print("4. Relancer: run deploy.js");
        ns.print("");
        
        ns.toast("⚠️ Déploiement incomplet - Vérifier logs", "warning", 5000);
    }
    
    ns.print("═════════════════════════════════════════════════════════════");
    ns.tprint("🐍 OUROBOROS v0.2.0 deployment script finished. Check tail window for details.");
}
