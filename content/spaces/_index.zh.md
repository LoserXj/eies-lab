---
title: 实验室空间
type: landing
# 与 _index.md 结构一一对应。验证路径状态：active（进行中）| emerging（起步中）| planning（规划中）。
sections:
  - block: spaces
    id: spaces
    content:
      eyebrow: 实验室空间
      title: 物理具身与验证
      lead: 我们的研究通过连接智能决策与真实能源系统的**感知与执行接口**落到物理世界。
      interfaces:
        - { name: 能源传感器, icon: hero/signal }
        - { name: 可控负荷, icon: hero/adjustments-horizontal }
        - { name: 电池与逆变器接口, icon: hero/battery-50 }
        - { name: 充电控制, icon: hero/bolt }
        - { name: 移动感知与巡检, icon: hero/paper-airplane }
      pathway:
        eyebrow: 验证路径
        title: 从仿真走向真实场景
        items:
          - name: 数据与物理仿真
            image: spaces/stage-1.jpg
            status: active
            description: 基于能源数据以及太阳能资源、建筑、储能与网络的物理模型，是所有方法的起点。
          - name: 闭环数字实验
            image: spaces/stage-2.jpg
            status: emerging
            description: 智能体在仿真的能源系统中行动并从后果中学习，然后才接触真实硬件。
          - name: 硬件在环与器件级测试
            image: spaces/stage-3.jpg
            status: planning
            description: 将真实的传感器、电池、逆变器和可控负荷接入仿真，让决策面对真实设备的行为。
          - name: 真实反馈与实地验证
            image: spaces/stage-4.jpg
            status: planning
            description: 部署到真实建筑与能源场地，以物理反馈闭合回路，检验可靠性。
      visit:
        eyebrow: 实验室位置
        title: 我们在这里
        facts:
          - { label: 房间, value: ZS831 室 }
          - { label: 楼宇, value: Z 座 }
          - { label: 校园, value: 香港理工大学红磡校园 }
        note: 欢迎预约参观。
        contact_url: contact/
        map_url: https://www.google.com/maps/search/?api=1&query=Block+Z%2C+The+Hong+Kong+Polytechnic+University%2C+Hung+Hom
---
