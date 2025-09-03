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
<<<<<<< HEAD
        description: "Hackatime API key",
        default: "CHANGEME",
    },
    debug: {
        type: OptionType.BOOLEAN,
        description: "Show more debugging info",
=======
        description: "API Key for Wakatime",
        default: "",
    },
    debug: {
        type: OptionType.BOOLEAN,
        description: "Enable debug mode",
>>>>>>> 3fcdca8725863981d01c73677c1114ada0aff130
        default: false,
    },
    machineName: {
        type: OptionType.STRING,
<<<<<<< HEAD
        description: "Hostname",
=======
        description: "Machine name",
>>>>>>> 3fcdca8725863981d01c73677c1114ada0aff130
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

<<<<<<< HEAD
    if (debug) console.log("Sending heartbeat to Hackatime API.");
=======
    if (debug) console.log("Sending heartbeat to WakaTime API.");
>>>>>>> 3fcdca8725863981d01c73677c1114ada0aff130

    const url = "https://hackatime.hackclub.com/api/hackatime/v1";
    const body = JSON.stringify({
        time: time / 1000,
        entity: "Discord",
        type: "app",
        project: projectName ?? "Discord",
<<<<<<< HEAD
        plugin: "vencord/version discord-hackatime/v0.1",
=======
        plugin: "vencord/version discord-wakatime/v0.0.1",
>>>>>>> 3fcdca8725863981d01c73677c1114ada0aff130
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

<<<<<<< HEAD
    if (res.status !== 200) console.warn(`Hackatime API Error ${res.status}: ${data}`);
}

export default definePlugin({
    name: "Hackatime",
    description: "Track your Discord usage within Hackatime!",
    authors: [
        { name: "lolo.zip", id: 547101350450692142 }
=======
    if (res.status !== 200) console.warn(`WakaTime API Error ${res.status}: ${data}`);
}

export default definePlugin({
    name: "Wakatime",
    description: "Fully automatic code stats via Wakatime",
    authors: [
        { name: "Neon", id: 566766267046821888n },
        { name: "thororen", id: 848339671629299742n }
>>>>>>> 3fcdca8725863981d01c73677c1114ada0aff130
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