---
title: "wash inspect"
draft: false
sidebar_position: 12
description: "wash inspect command reference"
--- 

Inspect helps you to examine the capabilities of a wasmCloud component. It accepts the path to the wasmCloud actor or provider and prints out the properties of that component. 

#### Usage
```
➜ wash claims inspect wasmcloud.azurecr.io/echo:0.3.7

                                                                          
                               Echo - Module                              
  Account       ACOJJN6WUP4ODD75XEBKKTCCUJJCY5ZKQ56XVKYK4BEJWGVAOOQHZMCW  
  Module        MBCFOPM6JW2APJLXJD3Z5O4CN7CPYJ2B4FTKLJUR5YR5MITIU7HD3WD5  
  Expires                                                          never  
  Can Be Used                                                immediately  
  Version                                                      0.3.7 (4)  
  Call Alias                                                   (Not set)  
                               Capabilities                               
  HTTP Server                                                             
  Logging                                                                 
                                   Tags                                   
  None                                                                    
                                                                          

➜ wash claims inspect wasmcloud.azurecr.io/httpserver:0.17.0

                                                                                      
                            HTTP Server - Provider Archive                            
  Account                   ACOJJN6WUP4ODD75XEBKKTCCUJJCY5ZKQ56XVKYK4BEJWGVAOOQHZMCW  
  Service                   VAG3QITQQ2ODAOWB5TTQSDJ53XK3SHBEIFNK4AYJ5RKAX2UNSCAPHA5M  
  Capability Contract ID                                        wasmcloud:httpserver  
  Vendor                                                                   wasmCloud  
  Version                                                                     0.17.0  
  Revision                                                                         0  
                            Supported Architecture Targets                            
  x86_64-macos                                                                        
  armv7-linux                                                                         
  aarch64-linux                                                                       
  x86_64-windows                                                                      
  x86_64-linux                                                                        
  aarch64-macos                                                                       
                    
```

#### Options
`--jwt-only` Extract the raw JWT from the file and print to stdout

`--output` (Alias `-o`) Specify output format (text or json) [default: text]

`--digest` (Alias `-d`) Digest to verify artifact against (if OCI URL is provided for component)

`--experimental` Whether or not to enable experimental features [env: WASH_EXPERIMENTAL=]

`--allow-latest` Allow latest artifact tags (if OCI URL is provided for component)

`--user` (Alias `-u`) OCI username, if omitted anonymous authentication will be used [env: WASH_REG_USER]

`--password` (Alias `-p`) OCI password, if omitted anonymous authentication will be used [env: WASH_REG_PASSWORD]

`--insecure` Allow insecure (HTTP) registry connections

`--no-cache` skip the local OCI cache

