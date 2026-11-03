---
title: 研究方向
type: landing
# 与 _index.md 结构一一对应。
sections:
  - block: markdown
    id: overview
    content:
      eyebrow: 研究
      title: 研究方向
      text: |-
        能源系统是动态的、相互关联的，且只能被部分观测。其不断演化的物理状态和运行约束，决定了智能体能够观测什么、预测什么以及能安全地做什么；反过来，智能体的行动又会改变能量流动、设备运行和系统性能。
    design:
      layout: split

  - block: focus-areas
    id: thrusts
    content:
      items:
        - name: 能源系统感知与可观测性
          image: home/thrust-perception.jpg
          description: "**能源智能体能知道什么？它需要哪些信息？** 我们研究如何从不完整、不确定且异构的观测中推断与能源相关的状态和环境条件，将地理空间人工智能、遥感、三维城市表征和观测质量分析，与面向任务的感知和状态估计结合起来，识别对可靠能源决策真正重要的信息。"
        - name: 基于物理的能源世界模型
          image: home/thrust-world-model.jpg
          description: "**能源系统会如何响应变化与行动？** 我们构建基于物理的能源系统动态表征，涵盖太阳能资源、能量转换、储能、建筑负荷与网络交互。除预测系统状态外，我们还研究以行动为条件的预测：在物理定律、不确定性和运行限制下，不同干预会如何影响未来的能量流动与系统性能。"
        - name: 能源约束下的具身决策与控制
          image: home/thrust-control.jpg
          description: "**能源智能体如何在物理世界中安全、自适应地行动？** 我们研究在信息不完整、能源资源变化和物理安全约束下的自主决策与控制，重点是将感知与世界模型转化为可执行的行动，评估其真实物理后果，并通过闭环反馈持续改进决策。"

  - block: focus-areas
    id: energy-systems
    content:
      title: '<span class="sec-eyebrow">能源系统</span>立足能源'
      items:
        - name: 可再生能源与城市环境
          image: home/case-solar.jpg
          status: active
          description: 太阳能资源感知、三维城市能源评估，以及可再生资源的物理变异性。
        - name: 建筑、储能与能源网络
          image: home/case-buildings.jpg
          status: active
          description: 能源系统建模、需求–发电–储能耦合动态，以及物理约束下的运行。
        - name: 面向城市能源韧性的多智能体协同
          image: home/area-resilience.jpg
          status: active
          description: 协调建筑、储能、车辆与电网设施等大量分布式能源智能体，使城市能够预判、承受并从扰动中快速恢复。
        - name: 电动交通与充电
          image: home/case-mobility.jpg
          status: emerging
          description: 能源感知的充电，以及交通出行、电池与能源网络之间的相互作用。
        - name: 低空 / eVTOL 能源与智慧能源农业
          image: home/area-low-altitude.jpg
          status: planning
          description: 研究兴趣，并非现有试验平台。未来可能作为检验同一科学机制的应用场景。

---
