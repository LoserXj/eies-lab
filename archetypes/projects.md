---
# Project template: `hugo new content projects/2026-short-name/index.md` (or add it in Pages CMS → Projects / 项目与成果).
# The page layout is fixed (layouts/works/); only fill in the fields and the text below.
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
authors: []            # lab member slugs, e.g. [dong-kechuan]
date: {{ .Date }}
tag: ""                # Model / Dataset / Code / Platform ...
summary: ""            # one line: card text and the page's first paragraph
cover: ""              # 16:9 image under assets/, e.g. media/members/figure.jpg
links: []              # e.g. - { type: code, url: https://github.com/... }   types: site paper code dataset slides video pdf
tags: []
draft: false
---
## Overview

## Method

## Data and code

## Research uses
