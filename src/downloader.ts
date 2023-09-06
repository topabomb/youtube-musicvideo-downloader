import cp from 'child_process';
import readline from 'readline';
import ytdl from 'ytdl-core';
import ffmpeg from 'ffmpeg-static';
import internal, { Writable } from 'stream';
import path from 'path';
import fs, { existsSync } from 'fs';
import sanitize_filename from 'sanitize-filename';

const downloader = {
  download: async (
    id: string,
    dir: string,
    options: { name?: string; videoFormat?: (formats: ytdl.videoFormat[]) => ytdl.videoFormat }
  ): Promise<string> => {
    let title = options.name;
    const url = `https://www.youtube.com/watch?v=${id}`;
    console.log(`id(${id}),url(${url}),fetching...`);
    const info = await ytdl.getInfo(url);
    console.info(`id(${id}),title(${info.videoDetails.title})`);
    let videoFormat: ytdl.videoFormat | undefined;
    if (options.videoFormat) videoFormat = options.videoFormat(info.formats.filter((x) => x.hasVideo));
    if (!title) title = info.videoDetails.title;
    const tmpFile = path.resolve(path.join(dir, `${sanitize_filename(title)}.tmp.mp4`));
    const targetFile = path.resolve(path.join(dir, `${sanitize_filename(title)}.mp4`));
    let ffmpegProcess: cp.ChildProcess | undefined;
    let audio: internal.Readable;
    let video: internal.Readable;
    const clearDownload = () => {
      if (fs.existsSync(tmpFile)) {
        let killed: boolean;
        if (audio && !audio.destroyed) audio.destroy(new Error('clean'));
        if (video && !video.destroyed) video.destroy(new Error('clean'));
        if (ffmpegProcess) killed = ffmpegProcess.kill('SIGKILL');
        try {
          fs.unlinkSync(tmpFile);
        } catch (err) {
          if (!(err as Error).message.includes('resource busy or locked')) throw err;
          else {
            console.warn(`unlink error:${tmpFile},ffmpegProcess(${ffmpegProcess.pid}),killed(${killed})`);
          }
        }
      }
    };
    clearDownload();
    return new Promise((resolve, reject) => {
      if (fs.existsSync(targetFile)) {
        resolve(targetFile);
        return;
      }
      console.log(`download(${tmpFile}) starting...`);
      let progressbarHandle = null;
      let updateBy = Date.now();
      const checkTimeout = () => {
        if (Date.now() - updateBy > 1 * 60 * 1000) {
          if (progressbarHandle) clearInterval(progressbarHandle);
          clearDownload();
          reject(new Error('check timeout error.'));
        } else setTimeout(checkTimeout, 1000);
      };
      setTimeout(checkTimeout, 1000);
      const tracker = {
        start: Date.now(),
        audio: { downloaded: 0, total: Infinity },
        video: { downloaded: 0, total: Infinity },
        merged: { frame: 0, speed: '0x', fps: 0 },
      };
      // Get audio and video streams
      audio = ytdl(url, { quality: 'highestaudio' }).on('progress', (_, downloaded, total) => {
        tracker.audio = { downloaded, total };
        updateBy = Date.now();
      });
      video = ytdl(url, { quality: !videoFormat ? 'highestvideo' : videoFormat.itag }).on(
        'progress',
        (_, downloaded, total) => {
          tracker.video = { downloaded, total };
          Date.now();
        }
      );

      // Prepare the progress bar
      const progressbarInterval = 1000;
      const showProgress = () => {
        readline.cursorTo(process.stdout, 0);
        const toMB = (i) => (i / 1024 / 1024).toFixed(2);
        process.stdout.write(`Target :${title}\n`);
        process.stdout.write(
          `Audio  | ${((tracker.audio.downloaded / tracker.audio.total) * 100).toFixed(2)}% processed `
        );
        process.stdout.write(
          `(${toMB(tracker.audio.downloaded)}MB of ${toMB(tracker.audio.total)}MB).${' '.repeat(10)}\n`
        );

        process.stdout.write(
          `Video  | ${((tracker.video.downloaded / tracker.video.total) * 100).toFixed(2)}% processed `
        );
        process.stdout.write(
          `(${toMB(tracker.video.downloaded)}MB of ${toMB(tracker.video.total)}MB).${' '.repeat(10)}\n`
        );

        process.stdout.write(`Merged | processing frame ${tracker.merged.frame} `);
        process.stdout.write(`(at ${tracker.merged.fps} fps => ${tracker.merged.speed}).${' '.repeat(10)}\n`);

        process.stdout.write(`running for: ${((Date.now() - tracker.start) / 1000 / 60).toFixed(2)} Minutes.`);
        readline.moveCursor(process.stdout, 0, -4);
      };
      // for pkg process ffmpeg.exe
      let ffmpeg_bin = ffmpeg.includes('snapshot')
        ? path.resolve(path.join(path.dirname(process.execPath), './ffmpeg.exe'))
        : ffmpeg;
      if (!fs.existsSync(ffmpeg_bin)) ffmpeg_bin = 'ffmpeg.exe';
      // Start the ffmpeg child process
      ffmpegProcess = cp.spawn(
        ffmpeg_bin,
        [
          // Remove ffmpeg's console spamming
          '-loglevel',
          '8',
          '-hide_banner',
          // Redirect/Enable progress messages
          '-progress',
          'pipe:3',
          // Set inputs
          '-i',
          'pipe:4',
          '-i',
          'pipe:5',
          // Map audio & video from streams
          '-map',
          '0:a',
          '-map',
          '1:v',
          // Keep encoding
          '-c:v',
          'copy',
          // Define output file
          tmpFile,
        ],
        {
          windowsHide: true,
          stdio: [
            /* Standard: stdin, stdout, stderr */
            'inherit',
            'inherit',
            'inherit',
            /* Custom: pipe:3, pipe:4, pipe:5 */
            'pipe',
            'pipe',
            'pipe',
          ],
        }
      );
      /*
      ffmpegProcess.on('error', (err) => {
        console.error(err);
        clearDownload();
        reject(err);
      });
      */
      ffmpegProcess.on('close', () => {
        console.log(`${tmpFile} download done.`);
        // Cleanup
        process.stdout.write('\n\n\n\n');
        clearInterval(progressbarHandle);
        if (existsSync(tmpFile)) fs.renameSync(tmpFile, targetFile);
        resolve(targetFile);
      });

      // Link streams
      // FFmpeg creates the transformer streams and we just have to insert / read data
      ffmpegProcess.stdio[3].on('data', (chunk) => {
        // Start the progress bar
        if (!progressbarHandle) progressbarHandle = setInterval(showProgress, progressbarInterval);
        // Parse the param=value list returned by ffmpeg
        const lines = chunk.toString().trim().split('\n');
        const args = {};
        for (const l of lines) {
          const [key, value] = l.split('=');
          args[key.trim()] = value.trim();
        }
        tracker.merged = args as typeof tracker.merged;
      });
      const stdios = ffmpegProcess.stdio.filter((x) => true);
      audio.pipe(stdios[4] as Writable);
      video.pipe(stdios[5] as Writable);
    });
  },
};

export { downloader };
