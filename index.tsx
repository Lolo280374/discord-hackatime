/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import definePlugin, { OptionType } from "@utils/types";
import { definePluginSettings } from "@api/Settings";

const settings = definePluginSettings({
    apiKey: {
        type: OptionType.STRING,
        description: "Hackatime API key",
        default: "CHANGEME",
    },
    debug: {
        type: OptionType.BOOLEAN,
        description: "Show more debugging info",
        default: false,
    },
    machineName: {
        type: OptionType.STRING,
        description: "Hostname",
        default: "Vencord User",
    },
    projectName: {
        type: OptionType.STRING,
        description: "Project title",
        default: "Discord",
    },
});

async function sendHeartbeat() {
    const time = Date.now();
    const { debug, apiKey, machineName, projectName } = settings.store

    if (!apiKey) return;

    if (debug) console.log("Sending heartbeat to Hackatime API.");

    const url = "https://hackatime.hackclub.com/api/hackatime/v1";
    const body = JSON.stringify({
        time: time / 1000,
        entity: "Discord",
        type: "app",
        project: projectName ?? "Discord",
        plugin: "vencord/version discord-hackatime/v0.1",
    });

    const headers = {
        Authorization: `Basic ${apiKey}`,
        "Content-Type": "application/json",
        "Content-Length": new TextEncoder().encode(body).length.toString(),
        ...(machineName ? { "X-Machine-Name": machineName } : {})
    };

    const res = await fetch(url, {
        method: "POST",
        body: body,
        headers: headers,
    });

    const data = await res.text();

    if (res.status !== 200) console.warn(`Hackatime API Error ${res.status}: ${data}`);
}

export default definePlugin({
    name: "Hackatime",
    description: "Track your Discord usage within Hackatime!",
    authors: [
        { name: "lolo.zip", id: 547101350450692142 }
    ],
    settings,
    sendHeartbeat,
    start() {
        this.updateInterval = setInterval(() => { this.sendHeartbeat(); }, 120000);
    },
    stop() {
        clearInterval(this.updateInterval);
    }
});