import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

export class AudioDownloadManager {
    // Check if audio file exists locally
    static async isAudioAvailable(surahId: number, ayahId: number): Promise<boolean> {
        try {
            const fileName = `surah_${surahId}_ayah_${ayahId}.mp3`;
            await Filesystem.stat({
                path: fileName,
                directory: Directory.Data,
            });
            return true;
        } catch (e) {
            return false; // File does not exist
        }
    }

    // Download audio file
    static async downloadAudio(surahId: number, ayahId: number, url: string): Promise<string> {
        try {
            const fileName = `surah_${surahId}_ayah_${ayahId}.mp3`;
            const download = await Filesystem.downloadFile({
                path: fileName,
                directory: Directory.Data,
                url: url,
            });
            return download.path!;
        } catch (e) {
            console.error("Download failed", e);
            throw e;
        }
    }

    // Get URL for playback (Local or Remote)
    static async getAudioUrl(surahId: number, ayahId: number, remoteUrl: string): Promise<string> {
        try {
            const fileName = `surah_${surahId}_ayah_${ayahId}.mp3`;
            const stat = await Filesystem.stat({
                path: fileName,
                directory: Directory.Data,
            });

            // Convert native path to Webview-friendly URL
            return Capacitor.convertFileSrc(stat.uri);
        } catch (e) {
            // File not found locally, return remote URL
            return remoteUrl;
        }
    }
}
