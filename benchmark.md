Running benchmark...
clk: ~3.03 GHz
cpu: Apple M1 Max
runtime: node 24.11.1 (arm64-darwin)

| benchmark         |              avg |         min |         p75 |         p99 |         max |
| ----------------- | ---------------- | ----------- | ----------- | ----------- | ----------- |
| sync: native fn   | `295.49 ps/iter` | `254.15 ps` | `294.92 ps` | `335.69 ps` | `445.29 ns` |
| sync: quansync fn | `283.09 ps/iter` | `254.15 ps` | `284.91 ps` | `315.43 ps` | `  9.81 ns` |
| sync: gensync fn  | ` 57.56 ns/iter` | ` 54.51 ns` | ` 56.78 ns` | ` 88.58 ns` | `124.34 ns` |

|                        |              avg |         min |         p75 |         p99 |         max |
| ---------------------- | ---------------- | ----------- | ----------- | ----------- | ----------- |
| sync: native add       | `284.97 ps/iter` | `254.15 ps` | `284.91 ps` | `315.43 ps` | ` 10.82 ns` |
| sync: native await add | `110.48 ns/iter` | `102.14 ns` | `111.00 ns` | `154.01 ns` | `207.21 ns` |
| sync: quansync add     | ` 85.88 ns/iter` | ` 81.37 ns` | ` 85.85 ns` | `121.39 ns` | `229.70 ns` |
| sync: gensync add      | ` 96.32 ns/iter` | ` 83.77 ns` | ` 88.44 ns` | `287.93 ns` | `  1.44 µs` |

|                    |              avg |         min |         p75 |         p99 |         max |
| ------------------ | ---------------- | ----------- | ----------- | ----------- | ----------- |
| sync: quansync.all | `379.39 ns/iter` | `332.16 ns` | `392.44 ns` | `791.99 ns` | `959.25 ns` |
| sync: gensync add  | `224.20 ns/iter` | `205.65 ns` | `221.67 ns` | `535.21 ns` | `790.36 ns` |

|                    |              avg |         min |         p75 |         p99 |         max |
| ------------------ | ---------------- | ----------- | ----------- | ----------- | ----------- |
| async: native fn   | `106.02 ns/iter` | ` 97.18 ns` | `107.49 ns` | `150.01 ns` | `170.93 ns` |
| async: quansync fn | `103.28 ns/iter` | ` 95.70 ns` | `104.38 ns` | `141.51 ns` | `181.34 ns` |
| async: gensync fn  | `253.97 ns/iter` | `240.30 ns` | `255.65 ns` | `301.01 ns` | `452.58 ns` |

|                     |              avg |         min |         p75 |         p99 |         max |
| ------------------- | ---------------- | ----------- | ----------- | ----------- | ----------- |
| async: native add   | `141.76 ns/iter` | `134.77 ns` | `141.25 ns` | `176.71 ns` | `205.23 ns` |
| async: quansync add | `315.35 ns/iter` | `299.40 ns` | `322.45 ns` | `367.67 ns` | `388.60 ns` |
| async: gensync add  | `314.88 ns/iter` | `291.43 ns` | `323.03 ns` | `373.04 ns` | `504.60 ns` |

|                           |              avg |         min |         p75 |         p99 |         max |
| ------------------------- | ---------------- | ----------- | ----------- | ----------- | ----------- |
| async: native Promise.all | `250.69 ns/iter` | `237.47 ns` | `254.38 ns` | `300.04 ns` | `310.30 ns` |
| async: quansync.all       | `985.55 ns/iter` | `922.67 ns` | `  1.01 µs` | `  1.08 µs` | `  1.35 µs` |
| async: gensync add        | `  1.07 µs/iter` | `589.54 ns` | `  1.93 µs` | `  2.25 µs` | `  2.68 µs` |
