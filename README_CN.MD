[english](./README.MD)/[中文](./README_CN.MD)

# 介绍

Youtube Music Video Downloader(mtvdownload)是一个命令行程序，它可以从 Youtube 批量下载音乐视频，它应该可以在您的 Unix 机器、Windows 或 macOS 上运行。它被发布到公共领域，这意味着您可以修改它、重新分发它或按照您喜欢的方式使用它；
mtvdownload 可以从 HTML 文件或网站中批量提取视频链接，然后逐一下载到指定的目录中；

> mtvdownload 暂时只能解析https://kworb.net中的youtube视频

## 演示

windows

```shell
./mtvdownloader.exe -d "./download/Top Female Groups" -i "./YouTube - Most Viewed Music Videos by Female Groups.html"
```

node

```shell
node ./dist/bundle.cjs -d "./download/Top Female Groups" -i "./YouTube - Most Viewed Music Videos by Female Groups.html"
```

![观看最多的女团视频](<./screenshots/YouTube - Most Viewed Music Videos by Female Groups.png>)

[在网盘中查看](https://drive.google.com/drive/folders/1SQBiu2eFOiIGchg7E3dxJNd-4Kta9Zwh?usp=sharing)

# 关于 kworb.net

https://kworb.net 提供了不同种类的音乐视频清单，可以访问[热门列表](https://kworb.net/youtube/stats.html) 查看 YouTube Top Lists，例如

- 有史以来观看次数最多
- 接近 1 亿
- 不同年份的热门视频
- 最受欢迎的老视频
- 女性艺术家观看次数最多的视频
- 女性团体观看次数最多的视频
- ...

mtvdownloader 能够识别这些不同的网页的内容并批量进行下载，例如 top100 的女团视频

windows

```shell
./mtvdownloader.exe -d "./download/Top Female Groups" -i "./YouTube - Most Viewed Music Videos by Female Groups.html"
```

node

```shell
node ./dist/bundle.cjs -d "./download/Top Female Groups" -i "./YouTube - Most Viewed Music Videos by Female Groups.html"
```

### 安装

Windows 用户可以下载 .zip 文件并将其解压缩到 PATH 上的任何位置，除了%SYSTEMROOT%\System32（例如，不要放入 C:\Windows\System32）。

从源码运行需要 node18 以上的环境

> macos、linux 您可能需要手动安装[ffmpeg](https://ffmpeg.org/);windows 运行 `npm run dist`会自动复制到 dist 目录中。

```shell
npm install
npm run dist
node ./dist/bundle.cjs -i https://kworb.net/youtube/topvideos_female_group.html -d ./download
```

### 选项

```
  -d, --dir <value>      output dir (default: "./download")
  -i, --input <value>    input html file or kworb.net url (default: "https://kworb.net/youtube/topvideos_female_group.html")
  -s, --skip <value>     skip n rows
  -q, --quality <value>  max video quality (default: "1080")
  -h, --help             display help for command
```

### 未来更新

- 更多的视频选项
- 兼容更多的网站
- 支持多个视频同时下载
