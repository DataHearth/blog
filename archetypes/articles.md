---
date: {{ time.Now | time.Format "02-01-2006" }}
draft: true
title: {{ replace .File.ContentBaseName "-" " " | title }}
summary: {{time.Now}}
params:
  tags: []
---
