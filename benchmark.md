Running benchmark...
clk: ~3.14 GHz
cpu: Apple M1 Max
runtime: node 24.11.1 (arm64-darwin)

| benchmark         |              avg |         min |         p75 |         p99 |         max |
| ----------------- | ---------------- | ----------- | ----------- | ----------- | ----------- |
| sync: native fn   | `280.17 ps/iter` | `254.15 ps` | `284.67 ps` | `315.19 ps` | ` 10.48 ns` |
| sync: quansync fn | `282.21 ps/iter` | `254.15 ps` | `284.91 ps` | `315.43 ps` | ` 10.23 ns` |
| sync: gensync fn  | ` 57.44 ns/iter` | ` 55.09 ns` | ` 56.40 ns` | ` 86.51 ns` | `114.61 ns` |

|                        |              avg |         min |         p75 |         p99 |         max |
| ---------------------- | ---------------- | ----------- | ----------- | ----------- | ----------- |
| sync: native add       | `281.28 ps/iter` | `254.15 ps` | `284.91 ps` | `315.19 ps` | ` 10.63 ns` |
| sync: native await add | ` 93.01 ns/iter` | ` 89.52 ns` | ` 92.49 ns` | `122.18 ns` | `163.55 ns` |
| sync: quansync add     | ` 84.13 ns/iter` | ` 81.42 ns` | ` 83.11 ns` | `112.60 ns` | `237.40 ns` |
| sync: gensync add      | ` 86.55 ns/iter` | ` 84.06 ns` | ` 85.73 ns` | `113.88 ns` | `134.39 ns` |

|                    |              avg |         min |         p75 |         p99 |         max |
| ------------------ | ---------------- | ----------- | ----------- | ----------- | ----------- |
| async: native fn   | ` 94.24 ns/iter` | ` 90.55 ns` | ` 93.73 ns` | `122.47 ns` | `168.51 ns` |
| async: quansync fn | ` 91.11 ns/iter` | ` 87.60 ns` | ` 89.86 ns` | `119.48 ns` | `162.91 ns` |
| async: gensync fn  | `250.32 ns/iter` | `236.61 ns` | `252.04 ns` | `291.00 ns` | `398.18 ns` |

|                     |              avg |         min |         p75 |         p99 |         max |
| ------------------- | ---------------- | ----------- | ----------- | ----------- | ----------- |
| async: native add   | `129.41 ns/iter` | `124.74 ns` | `128.35 ns` | `157.93 ns` | `191.80 ns` |
| async: quansync add | `298.89 ns/iter` | `287.86 ns` | `300.44 ns` | `335.28 ns` | `383.16 ns` |
| async: gensync add  | `291.93 ns/iter` | `278.49 ns` | `290.20 ns` | `348.91 ns` | `494.16 ns` |
