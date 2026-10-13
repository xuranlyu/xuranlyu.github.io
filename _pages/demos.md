---
layout: page
permalink: /demos/
title: demos
description: Small interactive pictures of results I find worth playing with.
nav: true
nav_order: 4
---

<div class="demo-list">
{% assign demos = site.demos | sort: "order" %}
{% for d in demos %}
  <a class="demo-card" href="{{ d.url | relative_url }}">
    {% if d.thumb %}<div class="demo-thumb">{% include {{ d.thumb }} %}</div>{% endif %}
    <h3>{{ d.title }}</h3>
    <p>{{ d.description }}</p>
    <p class="demo-topic">{{ d.topic }}</p>
  </a>
{% endfor %}
</div>
