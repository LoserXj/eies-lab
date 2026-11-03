---
title: Global facade & rooftop PV potential dataset
authors: [dong-kechuan]
date: 2025-06-01
tag: Dataset
summary: Building-level facade and rooftop PV potential for 120 cities, from 3D footprints and meteorology.
cover: media/members/dong-kechuan-bipv.jpg
tags: [Dataset, Facade PV, Rooftop PV]
sample: true
---
## What it contains

For every building in each city, the dataset gives annual and hourly solar irradiation on the roof and on each facade, the usable area after windows and obstructions are removed, and the resulting PV generation potential.

## How it is built

- Building footprints and heights come from open 3D city models.
- Facade elements (windows, walls) are parsed from street-view images.
- Hourly irradiation uses local meteorology and the shading cast by neighbouring buildings.

## Research uses

The dataset supports city-level planning of building-integrated PV, comparisons between cities, and training data for faster learned models.
