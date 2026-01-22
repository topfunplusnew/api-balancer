---
name: base-rule
description: This is a new rule
---

# Overview

所有的前端页面在编写的时候，都必须要有真实的接口作为数据支撑，严禁做假数据假页面，严格执行。

本系统的代理逻辑如下：
比如curl -X GET https://api.creatomate.com/v1/templates \这个接口，是需要代理的地址，本系统对外提供 baseURL为 http://localhost:25052/api/v1/ （这里的api/v1是指的本系统的接口版本，和第三方接口无关），然后接口地址为 /{apiName}/v1/templates，当请求本系统的creatomate代理的 /v1/templates 的接口的时候，代理转发到https://api.creatomate.com/v1/templates \这个地址，你来帮我改一下 所有的本系统代理的接口都按照这个模式来