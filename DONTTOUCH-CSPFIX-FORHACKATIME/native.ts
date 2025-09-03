/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { CspPolicies } from "@main/csp";
import { NativeSettings } from "@main/settings";
import { SettingsStore } from "@shared/SettingsStore";
import { dialog } from "electron";

type NativeSettingsWithCSP = typeof NativeSettings & { cspPolicies: Record<string, string[]>; };
const settings = NativeSettings as SettingsStore<Partial<NativeSettingsWithCSP>>;

if (settings.store.cspPolicies) {
    Object.entries(settings.store.cspPolicies).forEach(([domain, policy]) => {
        CspPolicies[domain] = policy;
    });

    Object.entries(CspPolicies).forEach(([domain, _policy]) => {
        if (!(domain in (settings.store.cspPolicies || {}))) {
            delete CspPolicies[domain];
        }
    });
}

export function getCurrentCSPPolicies(): typeof CspPolicies {
    if (!settings.store.cspPolicies) {
        settings.store.cspPolicies = { ...CspPolicies };
    }

    return settings.plain.cspPolicies || {};
}

export async function updateCSPPolicies(_event, policies: typeof CspPolicies): Promise<boolean> {
    return await dialog.showMessageBox({
        type: "question",
        buttons: ["Yes", "No"],
        defaultId: 0,
        cancelId: 1,
        title: "Modify CSP rules?",
        message: `A plugin would like to modify the current CSP rules to:\n${Object.entries(policies).map(([domain, rules]) =>
            `${domain}: ${rules.join(" ")}`
        ).join("\n")}`,
    }).then(res => {
        if (res.response !== 0) {
            return false;
        }

        settings.store.cspPolicies = policies;

        Object.entries(policies).forEach(([domain, policy]) => {
            CspPolicies[domain] = policy;
        });

        Object.entries(CspPolicies).forEach(([domain, _policy]) => {
            if (!(domain in policies)) {
                delete CspPolicies[domain];
            }
        });

        return true;
    });
}
