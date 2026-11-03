---
title: Spaces
type: landing
# One block (layouts/_partials/hbx/blocks/spaces/): intro + interfaces, validation pathway, where the lab is.
# Keep in sync with _index.zh.md. Pathway status: active | emerging | planning.
sections:
  - block: spaces
    id: spaces
    content:
      eyebrow: Spaces
      title: Physical Embodiment & Validation
      lead: Our research becomes physical through **sensing and actuation interfaces** that connect intelligent decisions with real energy systems.
      interfaces:
        - { name: Energy sensors, icon: hero/signal }
        - { name: Controllable loads, icon: hero/adjustments-horizontal }
        - { name: Battery & inverter interfaces, icon: hero/battery-50 }
        - { name: Charging controls, icon: hero/bolt }
        - { name: Mobile sensing & inspection, icon: hero/paper-airplane }
      pathway:
        eyebrow: Validation Pathway
        title: From Simulation to the Field
        items:
          - name: Data & Physics-Based Simulation
            image: spaces/stage-1.jpg
            status: active
            description: Energy data and physics-based models of solar resources, buildings, storage and networks — the starting point for every method.
          - name: Closed-Loop Digital Experiments
            image: spaces/stage-2.jpg
            status: emerging
            description: Agents act inside simulated energy systems and learn from the consequences, before anything touches real hardware.
          - name: Hardware-in-the-Loop & Device Tests
            image: spaces/stage-3.jpg
            status: planning
            description: Real sensors, batteries, inverters and controllable loads connected to simulation, so decisions meet real device behaviour.
          - name: Real-World Feedback & Field Validation
            image: spaces/stage-4.jpg
            status: planning
            description: Deployment in real buildings and energy sites, where physical feedback closes the loop and tests reliability.
      visit:
        eyebrow: Lab Space
        title: Where We Work
        facts:
          - { label: Room, value: ZS831 }
          - { label: Building, value: Block Z }
          - { label: Campus, value: "Hung Hom, The Hong Kong Polytechnic University" }
        note: Visits are welcome by arrangement.
        contact_url: contact/
        map_url: https://www.google.com/maps/search/?api=1&query=Block+Z%2C+The+Hong+Kong+Polytechnic+University%2C+Hung+Hom
---
