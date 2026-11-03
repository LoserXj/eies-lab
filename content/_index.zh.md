---
title: ''
type: landing
# 与 content/_index.md 结构一一对应；改动时两边同步。
sections:
  - block: hero-scene
    content:
      eyebrow: EIES-Lab · 香港理工大学
      title: '[能源具身智能]<br>实验室'
      text: '**能源塑造智能，智能重塑能源系统。**'
      primary_action:
        text: 了解我们的研究
        url: /zh/research/
      secondary_action:
        text: 团队成员
        url: /zh/team/
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
      eyebrow: 我们的使命
      title: 理解能源与智能之间的双向关系
      subtitle: 科学聚焦：能源约束下的具身智能与自主适应
      text: |-
        > 我们研究能源动态与物理约束如何为具身智能奠定基础，实现闭环交互与自主适应，构建高效、可靠、有韧性的城市能源系统。
    design:
      layout: split

  - block: loop-diagram
    id: approach
    content:
      eyebrow: 研究路径
      title: 从感知到能源系统中的物理行动
      subtitle: 看见、预判、决定、动手、检验——AI 在真实能源系统中闭环学习。

  - block: focus-areas
    id: thrusts
    content:
      title: '<span class="sec-eyebrow">研究内容</span>研究方向'
      text: '同一闭环中相互衔接的三个环节。<a class="section-link" href="/zh/research/">了解更多研究内容 →</a>'
      items:
        - name: 能源系统感知与可观测性
          image: home/thrust-perception.jpg
          description: '能源智能体能知道什么？它需要哪些信息？'
        - name: 基于物理的能源世界模型
          image: home/thrust-world-model.jpg
          description: '能源系统会如何响应变化与行动？'
        - name: 能源约束下的具身决策与控制
          image: home/thrust-control.jpg
          description: '能源智能体如何在物理世界中安全、自适应地行动？'

  - block: focus-areas
    id: cases
    content:
      title: '<span class="sec-eyebrow">物理验证</span>能源系统与物理验证'
      items:
        - name: 可再生能源与城市环境
          image: home/case-solar.jpg
          status: active
          description: '智能体通过遥感与三维城市模型感知太阳能资源和城市形态，预测光伏出力如何随天气与选址变化，并据此做出布局与运行决策，再以实测发电数据检验。'
        - name: 建筑、储能与能源网络
          image: home/case-buildings.jpg
          status: active
          description: '智能体估计建筑负荷与储能状态，用基于物理的模型预测调度行动如何改变能量流动，并在运行限制内通过可控负荷、电池与逆变器执行行动。'
        - name: 电动交通与低空能源
          image: home/case-mobility.jpg
          status: emerging
          description: '电动车、充电设施与 eVTOL 平台本身就是受能源约束的具身智能体。我们研究它们如何感知电网与电池状态、规划充电与飞行能耗，并在有限能量与安全约束下自适应运行。'

  - block: collection
    id: news
    content:
      title: '<span class="sec-eyebrow">最新动态</span>新闻'
      text: '<a class="section-link" href="/zh/news/">全部新闻 →</a>'
      count: 3
      filters: { folders: [news] }
    design: { view: date-title-summary }

  - block: markdown
    id: join
    content:
      eyebrow: 加入我们
      title: 共建未来
      subtitle: '<a class="section-link" href="/zh/team/">认识团队 →</a> &nbsp; <a class="section-link" href="/zh/contact/">联系我们 →</a>'
      text: |-
        欢迎对能源系统科学、地理人工智能（GeoAI）、物理人工智能（Physical AI）、基于物理的建模以及真实场景验证与部署感兴趣的学生、研究人员和合作者加入我们。
    design:
      layout: split
---
