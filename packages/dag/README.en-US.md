English (US) | [简体中文](README.zh-Hans.md)

# SecretPad Frontend DAG SDK

Modules in DAG

<img width="790" alt="image" src="https://github.com/secretflow/secretpad-frontend/assets/46579290/d5c1cd39-b281-460d-a9cb-667a2ff7c0ed">

- Util: Common utils in graph
- Shape：Register the shapes for nodes and edges in graph
- Data Manager：Data store for the graph. Data Adapter is needed when utilized.
- Action Manager：List all the actions in the graph. Each action can have a shortcut on
  keyborad.
- State Manager：Keep track the states of nodes and edges in graph
- Tool Bar：Expose actions available in graph
- Canvas： Initiate, refresh and reset the content of the graph.

Data flow in DAG

<img width="634" alt="image"
src="https://github.com/secretflow/secretpad-frontend/assets/46579290/af9e8811-13eb-4c84-8a02-6d41862c2e90">
