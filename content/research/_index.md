---
title: Research
type: landing
# Detailed research page; the homepage only previews these. Keep in sync with _index.zh.md.
sections:
  - block: markdown
    id: overview
    content:
      eyebrow: Research
      title: Research Thrusts
      text: |-
        Energy systems are dynamic, interconnected and only partially observable. Their evolving physical states and operational constraints shape what an intelligent agent can observe, predict and safely do. In turn, the agent's actions can change energy flows, equipment operation and system performance.
    design:
      layout: split

  - block: focus-areas
    id: thrusts
    content:
      items:
        - name: Energy-System Perception & Observability
          image: home/thrust-perception.jpg
          description: "**What can an energy agent know, and what information does it need?** We study how energy-relevant states and environmental conditions can be inferred from incomplete, uncertain and heterogeneous observations. Our work connects geospatial AI, remote sensing, 3D urban representations and observation-quality analysis with task-aware sensing and state estimation, aiming to identify the information that matters for reliable energy decisions."
        - name: Physics-Grounded Energy World Models
          image: home/thrust-world-model.jpg
          description: "**How will an energy system respond to changes and actions?** We develop physically grounded representations of energy-system dynamics, spanning solar resources, energy conversion, storage, building demand and network interactions. Beyond forecasting system states, we investigate action-conditioned prediction: how possible interventions affect future energy flows and performance, subject to physical laws, uncertainty and operating limits."
        - name: Energy-Constrained Embodied Decision & Control
          image: home/thrust-control.jpg
          description: "**How can an energy agent act safely and adaptively in the physical world?** We investigate autonomous decision-making and control under incomplete information, changing energy resources and physical safety constraints. The focus is on translating perception and world models into executable actions, evaluating their real physical consequences and improving decisions through closed-loop feedback."

  - block: focus-areas
    id: energy-systems
    content:
      title: '<span class="sec-eyebrow">Energy Systems</span>Grounded in Energy'
      items:
        - name: Renewable Energy & Urban Environments
          image: home/case-solar.jpg
          status: active
          description: Solar-resource sensing, 3D urban energy assessment and the physical variability of renewable resources.
        - name: Buildings, Storage & Energy Networks
          image: home/case-buildings.jpg
          status: active
          description: Energy-system modeling, coupled demand–generation–storage dynamics and physically constrained operation.
        - name: Multi-Agent Coordination for Urban Energy Resilience
          image: home/area-resilience.jpg
          status: active
          description: Coordinating many distributed energy agents — buildings, storage, vehicles and grid assets — so cities can anticipate, absorb and recover from disruptions.
        - name: Electric Mobility & Charging
          image: home/case-mobility.jpg
          status: emerging
          description: Energy-aware charging and the interaction among mobility, batteries and energy networks.
        - name: Low-Altitude / eVTOL & Smart Energy Agriculture
          image: home/area-low-altitude.jpg
          status: planning
          description: Research interests, not existing testbeds. Possible future contexts for testing the same scientific mechanisms.

---
