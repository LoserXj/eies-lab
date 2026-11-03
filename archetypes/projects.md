---
# Project template: `hugo new content projects/2026-short-name/index.md` (or add it in Pages CMS → Projects / 项目与成果).
# The page layout is fixed (layouts/works/); only fill in the fields and the text below.
# Each text field has a Chinese twin (*_zh) for the Chinese page; an empty one falls back to English.
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
title_zh: ""
authors: []            # lab member slugs, e.g. [dong-kechuan]
date: {{ .Date }}
tag: ""                # Model / Dataset / Code / Platform ...
tag_zh: ""             # 模型 / 数据集 / 代码 / 平台 ...
summary: ""            # one line: card text and the page's first paragraph
summary_zh: ""
cover: ""              # 16:9 image under assets/, e.g. media/members/figure.jpg
links: []              # e.g. - { type: code, url: https://github.com/... }   types: site paper code dataset slides video pdf
tags: []
tags_zh: []
draft: false
body_zh: |             # Chinese page text (Markdown); empty = English text below
  ## 概述

  ## 方法

  ## 数据与代码

  ## 研究用途
---
## Overview

## Method

## Data and code

## Research uses
