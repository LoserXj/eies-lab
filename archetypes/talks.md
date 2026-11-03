---
# Talk template: `hugo new content talks/2026-short-name/index.md` (or add it in Pages CMS → Talks / 学术报告).
# The page layout is fixed (layouts/works/); only fill in the fields. Leave unknown fields empty or delete them.
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
authors: []            # lab member slugs, e.g. [dong-kechuan]
date: {{ .Date }}      # start, with time if known
date_end:              # optional end time
event: ""              # short event name, e.g. ICAE 2026
event_url: ""
format: ""             # Oral / Poster / Invited / Keynote / Seminar
location: ""
address: ""
summary: ""            # one line, shown in lists
abstract: ""
links: []              # e.g. - { type: slides, url: /uploads/works/talk.pdf }   types: slides video pdf poster event
cover: ""              # optional 16:9 photo under assets/, e.g. media/members/photo.jpg
figure: ""             # optional figure, e.g. the first slide
figure_caption: ""
tags: []
draft: false
zh:                    # Chinese page; empty fields fall back to English (scripts/build-zh.mjs)
  title: ""
  event: ""
  location: ""
  summary: ""
  abstract: ""
---
