# ⚡ discord-hackatime

<p align="center">
  <a href="https://raw.githubusercontent.com/Lolo280374/discord-hackatime/refs/heads/main/discord-hackatime/install.bat">
    <img src="https://github.com/user-attachments/assets/0a9ed8d9-3d44-48f5-893c-2d99515d5ba5" width="500" />
  </a>
  <a href="https://github.com/Lolo280374/discord-hackatime?tab=readme-ov-file#how-can-i-install-this">
    <img src="https://github.com/user-attachments/assets/74b3d1de-63ce-478e-8639-736e61861936" width="500" />
  </a>
</p>

NB: The auto-install script is currently only avalaible on Windows-based computers.

<img width="1385" height="464" alt="dfgdfgdfg" src="https://github.com/user-attachments/assets/045ae21b-d7a0-4793-9d39-4ee4c085afa1" />

**Add Discord statistics within Hackatime!**
**Project made for the Summer of Making 25, at HackClub!**

</div>

## simple overview
This project is a simple Vencord plugin (I don't plan on making one for BetterDiscord, it's dead atp) allowing you to track your Discord statistics within Hackatime, for some reason I guess?
Built using TypeScript, to get a project idea for SOM 2025

</div>

## how can I install this
### prerequesites
- Git installed to system environnement (PATH)
- nodeJS also installed to PATH

### installation
1. **Navigate to your Documents folder**:

   ```bash
   cd ~/Documents   # or %USERPROFILE%\Documents on Windows
   ```

2. **Clone the Vencord repository**:

   ```bash
   git clone https://github.com/Vendicated/Vencord
   cd Vencord
   ```

3. **Install dependencies**:

   ```bash
   pnpm install --no-frozen-lockfile
   ```

4. **Create a user plugins folder** inside Vencord:

   ```bash
   mkdir src/userplugins
   cd src/userplugins
   ```

5. **Clone this plugin**:

   ```bash
   git clone https://github.com/Lolo280374/discord-hackatime.git
   ```

6. **Remove conflicting files** (to avoid build errors):

   ```bash
   rm -f LICENSE README.md
   ```

   This command may not work on your operating system! If it dosen't, delete them from your file explorer...

   > ⚠️ Make sure you delete them **inside the `discord-hackatime` plugin folder**,
   > not in the root of Vencord.

7. **Build Vencord**:

   ```bash
   cd ../..   # back to Vencord root
   pnpm build
   ```

8. **Inject Vencord into Discord**:

   ```bash
   pnpm inject
   ```

   * Select your installed Discord client (Stable / PTB / Canary).
   * Confirm with **Enter**.

---

### 🎉 yay!

you're good to go! check in your plugins settings page for "Hackatime".

## license

MIT license. check [LICENSE](LICENSE) file for details.
