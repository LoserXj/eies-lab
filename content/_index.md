---
title: ''
type: landing
# Restrained homepage: Hero (live 3D scene) + Mission + Approach carry the narrative; thrusts as short cards;
# validation as real cases; publications/team as selected previews. Details live on /research/, /publications/, /team/.
# Keep in sync with content/_index.zh.md.
sections:
  - block: hero-scene
    content:
      eyebrow: EIES-Lab · The Hong Kong Polytechnic University
      title: Laboratory for<br>[Embodied Intelligence<br>in Energy Systems]
      text: '**Energy Shapes Intelligence. Intelligence Reshapes Energy Systems.**'
      primary_action:
        text: Explore Our Research
        url: /research/
      secondary_action:
        text: Our Team
        url: /team/
      # Live 3D background (scenes/ project). theme: research theme in scenes/src/themes/; place: scenes/src/places/;
      # poster: shown first and on phones / reduced motion. act: pin one act (0–5), omit to loop.
      scene:
        theme: pv
        place: polyu
        dim: 0.15
        poster: media/scenes/pv-polyu.jpg
        video: media/scenes/pv-polyu.mp4   # recorded loop (+ pv-polyu-av1.mp4, pv-polyu.json); remove to embed the live scene

  - block: markdown
    id: mission
    content:
      eyebrow: Our Mission
      title: Understanding the Two-Way Relationship Between Energy and Intelligence
      subtitle: 'Scientific focus: Energy-Constrained Embodied Intelligence & Autonomous Adaptation'
      text: |-
        > We investigate how energy dynamics and physical constraints ground embodied intelligence, enabling closed-loop interaction and autonomous adaptation for efficient, reliable, and resilient urban energy systems.
    design:
      layout: split

  - block: loop-diagram
    id: approach
    content:
      eyebrow: Our Approach
      title: From Perception to Physical Action in Energy Systems
      subtitle: 'See, predict, decide, act, check — AI that learns in a closed loop inside real energy systems.'

  - block: focus-areas
    id: thrusts
    content:
      title: '<span class="sec-eyebrow">Our Research</span>Research Thrusts'
      text: 'Three connected steps of one loop. <a class="section-link" href="/research/">Read more about our research →</a>'
      items:
        - name: Energy-System Perception & Observability
          image: home/thrust-perception.jpg
          description: 'What can an energy agent know, and what information does it need?'
        - name: Physics-Grounded Energy World Models
          image: home/thrust-world-model.jpg
          description: 'How will an energy system respond to changes and actions?'
        - name: Energy-Constrained Embodied Decision & Control
          image: home/thrust-control.jpg
          description: 'How can an energy agent act safely and adaptively in the physical world?'

  - block: focus-areas
    id: cases
    content:
      title: '<span class="sec-eyebrow">Validation</span>Energy Systems & Physical Validation'
      items:
        - name: Renewable Energy & Urban Environments
          image: home/case-solar.jpg
          status: active
          description: 'Agents sense solar resources and urban form from remote sensing and 3D city models, predict how PV output responds to weather and siting, and turn this into placement and operation decisions that are checked against measured generation.'
        - name: Buildings, Storage & Energy Networks
          image: home/case-buildings.jpg
          status: active
          description: 'Agents estimate building demand and storage states, use physics-grounded models to predict how scheduling actions shift energy flows, and act through controllable loads, batteries and inverters within operating limits.'
        - name: Electric Mobility & Low-Altitude Energy
          image: home/case-mobility.jpg
          status: emerging
          description: 'Vehicles, chargers and eVTOL platforms are energy-constrained embodied agents. We study how they perceive grid and battery states, plan charging and flight energy, and adapt under limited energy and safety constraints.'

  - block: collection
    id: news
    content:
      title: '<span class="sec-eyebrow">Latest</span>News'
      text: '<a class="section-link" href="/news/">All news →</a>'
      count: 3
      filters: { folders: [news] }
    design: { view: date-title-summary }

  - block: markdown
    id: join
    content:
      eyebrow: Join Us
      title: Build the Future
      subtitle: '<a class="section-link" href="/team/">Meet the team →</a> &nbsp; <a class="section-link" href="/contact/">Contact us →</a>'
      text: |-
        We welcome students, researchers, and collaborators with interests in energy systems science, GeoAI, physical AI, physics-based modeling, and real-world validation and deployment.
    design:
      layout: split
---
