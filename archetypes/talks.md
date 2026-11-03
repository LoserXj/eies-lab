---
# Talk template: `hugo new content talks/2026-short-name/index.md` (or add it in Pages CMS → Talks / 学术报告).
# The page layout is fixed (layouts/works/); only fill in the fields. Leave unknown fields empty or delete them.
# Each text field has a Chinese twin (*_zh) for the Chinese page; an empty one falls back to English.
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
title_zh: ""
authors: []            # lab member slugs, e.g. [dong-kechuan]
date: {{ .Date }}      # start, with time if known
date_end:              # optional end time
event: ""              # short event name, e.g. ICAE 2026
event_zh: ""
event_url: ""
format: ""             # Oral / Poster / Invited / Keynote / Seminar
format_zh: ""          # 口头报告 / 海报 / 特邀报告 / 主旨报告 / 研讨会
location: ""
location_zh: ""
address: ""
address_zh: ""
summary: ""            # one line, shown in lists
summary_zh: ""
abstract: ""
abstract_zh: ""
links: []              # e.g. - { type: slides, url: /uploads/works/talk.pdf }   types: slides video pdf poster event
cover: ""              # optional 16:9 photo under assets/, e.g. media/members/photo.jpg
figure: ""             # optional figure, e.g. the first slide
figure_caption: ""
figure_caption_zh: ""
tags: []
tags_zh: []
draft: false
body_zh: ""            # Chinese version of the text below (Markdown); empty = English text
---
