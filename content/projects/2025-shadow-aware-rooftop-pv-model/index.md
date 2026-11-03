---
title: Shadow-aware rooftop PV model
authors: [dong-kechuan]
date: 2025-09-01
tag: Model
summary: Spatiotemporal deep learning that predicts shading and rooftop PV potential about 158 times faster than simulation.
cover: media/members/dong-kechuan-rooftop.jpg
tags: [Model, Rooftop PV, Deep learning]
sample: true
---
## Model structure

The model takes a height map of the surrounding buildings and the sun position, and predicts the shading on each roof for every hour of the year. A temporal branch then turns hourly shading and weather into PV output.

## Why it is fast

Ray-traced shading has to be recomputed for every hour and every building. The learned model replaces that step, which is what makes city-wide runs about 158 times faster than simulation.

## Inputs and outputs

- **Inputs:** building heights, roof geometry, sun position, hourly weather.
- **Outputs:** hourly shading masks and rooftop PV potential per building.
