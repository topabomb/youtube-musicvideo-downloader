[english](./README.MD)/[中文](./README_CN.MD)

# DESCRIPTION

Youtube Music Video Downloader（mtvdownload） is a command-line program designed for bulk downloading music videos from YouTube. It should be runnable on your Unix machine, Windows, or macOS. It is released into the public domain, which means you can modify it, redistribute it, or use it in any way you prefer.

mtvdownload can extract video links in bulk from HTML files or websites and then download them one by one to a specified directory.

> Please note that mtvdownload is currently only capable of parsing YouTube videos from https://kworb.net.

## EXAMPLE

```shell
node ./dist/bundle.cjs -d "./download/Top Female Groups" -i "./YouTube - Most Viewed Music Videos by Female Groups.html"
```

![Most Viewed Music Videos by Female Groups](<./screenshots/YouTube - Most Viewed Music Videos by Female Groups.png>)

[View in Google Drive](https://drive.google.com/drive/folders/1SQBiu2eFOiIGchg7E3dxJNd-4Kta9Zwh?usp=sharing)

# ABOUT kworb.net

https://kworb.net provides various types of music video lists, and you can access the YouTube Top Lists section by visiting Hot Lists. These lists include:

- All-time most-viewed videos
- Videos approaching 100 million views
- Popular videos from different years
- Most popular older videos
- Videos by female artists with the most views
- Videos by female groups with the most views
- And more...

You can use mtvdownloader to recognize and batch download videos from these different lists based on your preferences. For example, you can use it to download videos from the "Top 100 Female Groups" list or any other list you choose. This flexibility allows you to easily download music videos based on various criteria and categories.

# INSTALLATION

Windows users can download the .zip file and extract it to any location on their PATH, except for %SYSTEMROOT%\System32 (for example, avoid placing it in C:\Windows\System32).

Running from source code requires a Node.js environment of version 18 or higher.

> For macOS and Linux, you may need to manually install ffmpeg.
> For the Windows platform, a distribution package of ffmpeg is already provided in /ffmpeg. Running npm run dist will automatically copy it to the dist directory.

```shell
npm install
npm run dist
node ./dist/bundle.cjs -i https://kworb.net/youtube/topvideos_female_group.html -d ./download
```

# OPTIONS

```
  -d, --dir <value>      output dir (default: "./download")
  -i, --input <value>    input html file or kworb.net url (default: "https://kworb.net/youtube/topvideos_female_group.html")
  -s, --skip <value>     skip n rows
  -q, --quality <value>  max video quality (default: "1080")
  -h, --help             display help for command
```

# FUTURE UPDATES

- More video options
- Compatibility with more websites
- Support for downloading multiple videos simultaneously
