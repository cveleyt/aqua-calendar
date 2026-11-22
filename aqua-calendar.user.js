// ==UserScript==
// @name         AQUA Calendar popup
// @namespace    https://cveleyt.github.io/aqua-calendar/
// @version      1.4
// @description  Small popup on Torn with the next AQUA faction events and the current war. Reads the AQUA calendar sheet. Does not click or automate anything on Torn.
// @match        https://www.torn.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      docs.google.com
// @connect      googleusercontent.com
// @run-at       document-idle
// @updateURL    https://cveleyt.github.io/aqua-calendar/aqua-calendar.user.js
// @downloadURL  https://cveleyt.github.io/aqua-calendar/aqua-calendar.user.js
// ==/UserScript==
(function () {
  'use strict';
  if (window.top !== window.self) return;
  var ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAd0klEQVR42uVceXzU1bU/597fMlsmOzvuVku0VbFafCrG2mp92tfFmboUZM2QEASNURH0l18VDRUEDEQmCYkgWjvTvuqrW10KvFqfttbWaqiloghCIGSf7bfde94fJC21dkMsUe9fyWd+986d7+97zzn3bADDe+DQH0u+v/7qOzduPA0AwDAM9rcmvP+zRa1NF86///5jDloPDcNQhj6/7YGWxXVtTfMAACKJBP9XN6gMV+SICBGRDMPwiROOasoJivKcPOUfzTNNUwIAu6ktHuW6PpMYngvZ1CQAQCORUM1o1DFN06tpvGeEnl96pyQ5hbnWsQAAE9rb6ZDf8LADDwAqYjEl+MXTHwNdP85N525ZHZv7qGEYbBCkv5pTV1eHznFjzlMDoXsEwhf84TBk93U+fdeUmV8dei4CwD+zvqWKaepNoZLicf0de79719RZRiKR4NFoVHz8GTjIPADA4Lp4o2R0BtnuW6tjc/9nEFgC0/ygY0uiuPhUkrBIet5nkHNwUmmJnvcwAOCN8VXHBfILZgiir2o+3+meJ2Cgc3+WZdyNAIDth8C+YXuEjURC6071tDhMXKQg7wxqGs1btUqtgzoX8K/Zt7VsKyKiBIDXalbeswgE3RcIBYscz/bJAetpACDiqp+kHAcSTrRzlqP5fAoRvMT37t1uGAZ+EKv/mcGGE3CRRIIDIrldHWf4uHKlgkpBQPef6rreEw3z59tQ99f7NQxDSUaT4rKKisD89a1LAyNGvOB6VhMJupUR/Obu+fP3x+Nxdfmsqje+f/uSCsZwv6pqGgIwYTs/NE1Tbv4QOAwbAA3DYBNKS9EwDOYGAjPIsR8EwF2OZRHP5l4/wLQyev8c0zS9mjX3/efJF0x6jUjEZCb3X8vnLGjzXHsH5uxGwzBYYWGhvLm+Pv/Ku8wt6Pcdm+3pnk1ZK40MdgIAXH355fixB9A0TWmWl3umaUrO+W89VTlG0dSjuaY5LvDfvU9LYiQS4aZpypqWpjlplVczgmMCtnvFktlznq6Ix9U7ps3+tTkr9gwAQDQaFerY0gcLSorPTnf2zL4nNq8FrewMv4tbDcNgsTPPdA9138pwYJ5pmrJ2ffO31WBgrtPbV23lrNe1cGgl41wVjmsRkX7wnEQiwaLRqLj1wdZleSNH1ARSqded7r6Z9bGq5yricbUpFnMNw2BwwQXMLC/3bmptWhYYOfLy/Tverb83VtUSj8fV2KxYcmi9xRtapnmO94f6WXP+zyBi5gF5+vFSIrqmlzNVG2P5/DNXTpkxv2Zj63ZV106Wjg2Ce386YgYZLIpRcX3T6tmOqtT09vbu0Txv69KKyg2RRII3RaMeAEBZWRlGy8vFTa3N9xUdNXZeam/nlvoZsVt9RCyG6AIA1DauOEkJFxh6fv5VsqfvEgCArckkfqwYaNbVkQHA9lsDdWGS5ygEu4zJkxWLsVLHcQAAMY8H/gwKRuWiePz4nE9ZSQgkbAf693YvIiKsAyAAoHg8rkajUffWtuYlgdEj56V6+7q93tQ8JAJjcx1b3Np6vNT4XK7wKUxTijzXAXJd52MpAyPJJDNNU4ZV/5nA8AWtZ+Ax69pr7nBt521BBI7rahkUYwAA2gE4AJAMqrFAQTigqSoyZG823HTT9rq6OjQRpbHJUGKxmLuwrWluD1BBT3dfu0znbl46b97riWSSwWaQHoqopqknSuEWeVJKmbN3232p1wEAktGo/DgBiMloVMxvW1FgS2dX/ZXXVlsl+XOlws5kgL9SFVWqPh0Zh0kAAFsBhLHaCBFjl8isleaOk3E91wIAgDJQjE2bFLPc9Gra4ldmEO9xpZyU7u+/R9uxs80wDCUajYqtZWVYP332knRP951I+AJH3k9C/vLeG2/sGjLIPx4AEiEQQUU8HuAYet5fUPLbG9riC1EQkhB9POCboXLOVFUDn+b7jmEYWjIaFZALBaSUn/Gy1lvZTO7VUGHhhQsbG88zo6Zjlpd7C1vjV+tB/8a8grDfT7h9NNeSB0SFKYAOXF0jkQjX8/I2WNncMpEaeNGy7SYAwK1bt+LH6wgjkubHkSpTNmd7B27nyBd4v33ddAjCQtBjVlf39+2cTR7np1jjRp0DRGjW1nZypj6v5gU+g1I+Zlm2zw75nrtlQ8vNi1vWmqTrG4EpHB2nN8xxiRmLZbeWlSEgUCSZYMloVBz3lQsXEWKJSGWfER1dU4LvdTwDAJRMJsXHB8DB+26xr2B3dteeeo40FhX+aObkk1MdTz13Ke9LN/kKC7/EGUPBkAtNuR0QiYgQXfsJXzgcUPzB03N7932TAN/1FRfVU37e7S6iZIyTSGXvuGt6xW8TiQRPRqNismEoyWhUXH/f8rP0ksLbuZSPr6ipydUvXNh7qNe4I89AAjCjUUcvCYVty93yzh93zI1XVHjJZFJwRfb4SCxmQLs5AvCAv/zWtvi3EJH6Urs2ZPbvfyc0ouiavNLiShDCyaXSImc7LhGwXCrV1f/rPc0V8bgKAGBsMpQtpulNiEQ0vaioyfM8W7HlwwAAQ898aIflcBq33NVQjMcXPZBOpZ4JSNrJiwoe8UiqihAddtfAucurq99d3BL/GoTz1pOqFkjPA3JtEAAAXAXhuo4/k/7Sklj1C0Nr1i5dOgbHjmz254cu7d+zd9Pu57Z8OZFISESEf1VxDDsAhzzB41Pd0UBR8Zxsd893FeJ7FJ2/CrncFRQONeuh0GhBALnu3meDO3ZdZpqmc33z/XFfcfEsYVkCUSpcVVGk7T8wv+94jrTHzuRm6EztyXr2yXog8D3V7xtn5dIyN5A5ryE290WDDGbioR/fYcVAwzCYfcKxb4OuYrY/zQtl7hyWVzQ6a3s3ok89n2yrHjTtVn9hUYnV2fnlzHt7XwufcOxWl2QxSUkAIHyBAMLAQNL1vNe0kpJ6RAZuNgsSEVzXgWAoBG5vX+Pd02bO/VevbMPembAVQFEB7+vdvnOyonBfmmth4+qpL3Mml4quvtOXTpu9Amyv3k6lXqeM3R089qinSFVKQEoSUjJVVVUppcLyC65CTfuss2//Yqun7z7XsgZc15HSdUV/b0/D3dNmVhuGwcwDSuzwBW2Gi1PhhpbGGQrXR78TzKufUFqKZnm5d0ARbFJgxw7lp7fdhpO+a2woGjP6ioGuLlcicpUxEgPpGtQUnQcC1b788Ph0V48DSN2q7hvtZrPpbNqKramqenjw2NKHkXvDVokYZLCBe8P6ipqa3JBsjABAe3s7DXlWajc+cDchzPNl3SUy7F/MfIFAunP/DStnx1YAANQ0No4QPmWSpqhXKAof5znu6yKde2h5dfXLgy/psIE3bIexaZPyQf/f1Ny80Phxkubf33DBTW0tD9/x9GN068Pr1w498/55fy/cedjjrsPpGA/J55q25vPB8jqXV1ZuvaX5/kv10aOeGNi9Z66uKIVFJ55wZ9eOnb/63tTpZw2GQAeDc4TRZJIdFIWD9vZ2+jDG8sdKBkYiEf9Jka/fIAGvsXPWLpHLLMpamc4RY456x3Hsekhnu0NHjV9uDaTfdnv6Lg3s2/fHrWVlmDyEkOQnBsAh8G5tWn0aFuS36KH8iemu7pu/N3X69wAAbtq4fqdAeEXt7FmqHzNmi+dJRezr/o/66uqXj/Te2XCIAwMAfKfmnmCWKW2hktKJ2X2dKwbBw1sefvBRKSXoezvq+fhRjxJX9WxXd2V9dfXL81at0m9uWDXPaGvzfWoBNADQNE159KlFy4IjRpzWt7tje4EjTACA29a3tnJdnyw7u78iSkc0uIyPSnfuq11RWd1sGAbTHEehYGBBVtinDGnxTxWAgwat/G5j40mkwDQVBHHXe/KWWKy/dn3zt/WiwmnO7r1f00YUL9BHlJ7Vv2//HffOqlxmJBLaoFIYEcgLHQfIRh2IZ5ThpwrArWUHfnAPF1/0FBWz6ZxEz355YVvbyXlFxY+ke/vm2yp83j9yRMzq7Xl5Qii8LJFI8DG9vURE6CvO/4aenw9SyslDGvfTJwMBALh+Ur/j/Tyby223+/p3eCr+yO7rX+2l07vzxoxpSO/v3snTzn/NnzJloD3STnv27BGISL1SjN/V2dmVIpmFIYP73zyGRVhT9anjfcHARboEkgifz7lOYzZr9ftHlTaTIEcM9M+9p2revkgiwbcmAZJmVNzUvPabTiBwGhBxv88/7mBGf+oYSFIK4bkgFYYu4EjZvfsH/tLiVt3vK5Td3XPurZr3eCKR4BPa2zEZjYq5d91VzEKBhvxg8IL8/HChBFLh06iFJ5S2o2EYjIHM6bpOlm1JT1engV4ykSPuSHV2raufPadt3qpVentpKZqm6RlGPBA+9uj/Vny+MblsyhKuS6onBz6dMnAzSNM0pcy5P0dJSJ6Qik8/Si3JvzO9s+M7y6bNngUA0DB/vm2Wl3s3rln5udTx6lNq0H9+LpMRklBDAETh/RQAIPlpuYnQoPF8W0vjyYKxc9JpZ2OwOP91DOgneJbt6YGA6lhWNxfiMSHkC0CkIOOTbCGieigYzKbSHknigVCQ0PUGnFTXKSsqa3YDEcJh8vMNawZiXR0iIr2SffNt0H0L83y+IvS8mMI4oqqomXTKQcRiNRSaoefntSrhvCbw+6cTsqCTzgkpJWcMPX/Ax4DEIysqa3YnBnMLP/kMPMASWNTaOo6EPRoDvvs9gK6l10y/uLa5sULLz69Hn14ohQeu7QCQJEmAwpMCARkgIkkp8kIBLh2ny01Zp2NPT8qXy6U+Ko/LcGIgRg64mogprNbz6QtpIFUZKCr4Ss2GloeXza5qEl07j6dUbhHZzmYmZR9jXHDArKYpXNM4EHiu6td5Jmfv8foyF/lDWhGMKq03TVN+VD6/YQOgYRg8GY2K2vUtqzCoX8IHcg8yNTCmZ0/n/OCIEVfVPLhu54DMO3/JNVPqs7/f/g1MZb5i9aW+JlK5zRxAEBAEwmGVPLHbs61vL62sfC3niFtRVUoADmRvfWIN6Ugiwc1o1Ku8996LXMZmMsu5hAXUGaGjx09339z+pYGOzqnA2OrwmNJHq9bFs4SopAC7icgXLikq5AjgWJYl07kf5jr237Hmxhu3LWi490x/UcG3U537okdKCyv/LvCS0aiojTecQXn5T2fTmatt1zs9b/zo6X2dnTs8DTpXTp/1sxtXr36WK+yrmqp+3fU8TZF0IlOUduHYWemKX9jZ9JPLZ1W9AQBwS+O9x4niUT9wLLs3L5f6xaEWygx/JTJosgAiW7Ch5V1V1f4bevp+RiNLf+xYzq68jHXlkljsxaHU3PdlfjAE+CvFsKCpqUzJ8/0gVFpalnrvvRuWT5u9YuglfdIAxMmGwf/XNL2a769/3rZdK9SXvtkbO+LnAFBgd/dcdN+c6ucHa9ekWVdHgEiVjY2Fo0KBa2TOfnNrYeGmc0MhZf6ll9oVEyeqoapYBfi1u/JKSsLZfV3NX9ADlckDiZFHxKX/kR7hinhcaYrF3Op199d7wjtO2997eaak4BFd4QVeX//1982pft7YtEmBCzZLE005GUA5e31btWdbZ0vhbQEh3k5GoyIJIBY+tH6yJeSdUuPnIuPQ39HxwDmPP1MZTSYlHMHxkQE4edMmpam83J3XGp/FVLVW7+09LZUfvCuvtKRMdPe2rZhesdIwDK1j2zZqKjdlzQPNEzXdv1q6zkua7lWb11Z2AwAsWL26DPMCizxViah+rhARDPQOLI/Pit2YbxgMiOBIGNAf6REekkez16z8guLzP4nkXslRvSAwomRxqrMrOd4WsXc4Tw/JvPnNa273FxSaiuNddec1Ux8BAKiYOFENVs+5Tqr8dkXXwlICqAxtyFp3fO/amUsMw2B1dXWERxC8jwTASCTCk8mkWHz/yhOd4tI37WzmO6mMu1fN8/3Mh7jNt7vzrKW33NIPAFCxtuFMnbHzuaJeKhnLBjz3f12uXKoQvgx+7XKXYZlj2QCI4FPVbnDcK5ddO/O5wcSgYZFhwOEwOwnaS0vZ+FNO8StFxZs4QjI3kHqJ/Pr3yZPbIJuOrryh9j3DMNjEaHQc8+vPIWCeJELp0uIAY5OElH2erlSDTx/l5CxX0VQuPG+r6E1fsjJW+UvDMBSzvFzAMBmH9SYSTSaZWV7uFRWFnyWSA7i7s4WH8x7VNKUkCPyO++de//t5Tz6pm6YpUefVut83FhjLJ8SfhAphu6Xii5bGTwJFUe10xtV0XUFJ++39fZetvu66N41NmxTTND0YRoMdTqWRjEZFdWvTrahrpVp/5hu50SXL8goLC7jjVq6aNevRinhcLXr5ZRcAQGG4UTJ4mAieWj0zdp9l81FSUR9Wfb4vea4jCYETAEDWvq2ltvadinhcHcrUguHYk+DDJgOZ5eXe/HVrpvryi9a7e7vPo3Dg5rzRIy/r2/neQ4Uz90zdmijDZDQqgejA1+Kf5dfc9Q3FMs3GaipbwAryrrUzWaHqukqW/XbHU89+JplISDjCyuIjM2MGBbpX29p6hq1AU6a/91JHZ6eOGD3ysvTezpfv27lnKtABAxkACA4kAcEtDzRXkIe/6hXiDUq5J6j5/h9JgCIvl0MAYIxzkACPJZNJEUkmeRJAfOIAHAqMX7tiRUEG6KeqhyYXWKDnFzb27e15K5gSlWCaMlJWxieQQSaaVBFvjCBncyXB8wLF5ZyxL/vzQ9M8J/cTFgzNEZaQgECcMSCmbB2KncAwHezD3nETiQTXw6GfSdd73Emlfm35AuuFY6es/v1fX1o16zeRRIQno1GxNVmGhmEwj/GLCbDHtry9NrDP6po6lgN0cIFvCAkkCMETCFIS6OTpg7ET+MQBaGzezE3TlM/099UzZD0jQ6FaJz9/MSKqTjo7paX6hvahcnwgwmQ0KtIjR5b4BBU0zYp90/Fpl7kS3lVUWDeQyi5ymTIRuYquR54nASQgCD5oZV3wCQNw0BbzYs3Nd6iczQx1pWO7rNwTmq6dp1r2XS2VlY9NNow/mxwH+r+wnSWburnC+yoeaGt3PXFKSIXksqun/U7X1dMxLzQ9m04TY6gxIBQSwCLF+cQxcKhPwaympvMIYapIZb6QLvQtLBo18iw3lV7VMHv2IsM4UBkE7yvpT0aTwhbyOhJyPkvRucunzf51PB5XiSnkZjKbGYCUQhIhkiQCcp2LBqdLGO6tlf4F8Khq7eoLs6g8xJC95eP8NQz5q7jjto+13Uk3z5yZNurq/uk2IkMdim5Yu+bbGUVrFYh+kiQUTVPItX/fGy449Ui5qg47Azs6OjgAkKf7IlooMNIDGJ0Fmupmc3/I9vZffvOsWSn4B+ANBX6qVq8+bebKlSOH2js5XPkO6FpASikAgLuOI5mqnTg2lSoHADyUvlbDDsDRo0cLIMACEhsUz32RKZgvJL0B6ez0luuueyeSSHD4B8wzTVNWxFcdL3xaWSAcXhGJRPjuY4/6msPYT7jt/JwpCpckBZAkpqqKh1g1nMsS8BDn0Lx58/TMxM9PJuG81Taz6u2/1dPq/fNqNtwT7HPy3yYJS4OaepabzTVpulYBQKU20YPM72vNZXI2A1AlMqkpnFjOmry2quqlI+W2P9yGNA2CZQPAM0M24T+qOxtsr0S5XPgUxtFOD/RvUMOhMlLwCincx4JWdquaX1zrahrmMlkExhClFMhVn1CVO+etWvWfRe3t4kikbxx2d9aWLVtoSC5FJkzALeXl9E/MAQCAc771pYwO2tmhwvx+4FiLnmhbU1G5cdI3vjaa+Xz3ZB1nP0MoQCDGFVSEFFLPCx4vSXjLamo3GQDKli1b5CfKmXDweoZh4AclOk5obyeoqwMTUVY2r/2mkp9/E9j27xqmTKsAALhl/fpizPSOznDVL4KBX2Ytx0NCJJQuY5zpqgo8l7umoaLyhx8Uwft4e2MMg/2zxS7vl2PXP/DA2DDnKXPKlIGhDc1piTd7qj4rZztv6hyOkQAcgBgSvuA4XnRjVVXn4DryL6OgH2wmDVUuTThQsXRYPdnK4SzPMgzD1zlmxBmuquYpABeiqhUIKXIqgA+F9zuZdX8XaW9/5WDPiqqwS/qEdzIA1F7b1ubLBoNuUV/fXR2OHWZc0QsDvpNTtt2Tc7yMy3G7pihPzGlsNNdGo4+/byMsUlaGE0pLsWPbNk23LNEwf749GDMRH1TgfTgUEh4GV5asWr38BAyXTLeFOFcKNwfI96IUb6sq28MJ3lKlVFRb2P0qG2MrSloSUYhreWlwt4UkHA1cedCyrevaZs9pG1q7au3a86VPf1ZRudKXzb0KjKUkQJZLOhsRhCpoaTidXjsyFNJ6AWBpLNYPAGCsWHFMn65/3eZ8l5+xbwkp3QzRkx6irQO8OXrPnm0HWwv/hPXw0QA49MXRhoaLS0uKHvE8L2jb1hxmuc+3Vle/O/TcWatWhScE/XUBXbuCGB+fsx0QJB1d4Zrnue2ALJ8zFhSu61cYS/o528h6U79cdf31fdeva5qaQrzfk0IK4h0AlOKMTgWJGQnoIMGvC6XzPx4Bcxmb4CL/P5/jPN9YXb0XAKC2peWkjJR+T8rjXMTPAcI5EhlnJF5VGf6y6c8NyPBQjzV+GOZVP7BuqgwETS7lKK+795L7587dMnScFowZM9IK+hcPeJ7DhDg/4NPPkEK6JISUROiSeIcBC0uigEB6QQE6AYAdrSDTUNI2j7Gfo3C5AvgNyTDkEcsiSE0BSgOybkFSSMSSALL3Rr2765zdY8dO8ACuAqSLEfAXDsHdD1VUvHfwvisbGwstjccFwBUIAAj0vMbwhqYZsTcOtYslfhj2zW5d9+KIY8ZPynXs7R2/bftxL5aVpQCAJ6NRp7Jt3dpAaWmst3OfEISOIGkBAfr8vgIEAtd2SAB0C8T9TJKtkDzaYdjNAEuRQEPG/IwhSOFlQUpByBQGIABknwdsBwM6JejTC1THvbVhxuy7h/Y2JR4/19O0SUzKt4Kelxm9Z89zHWPG8N7CQkxGo86CxsYLBzT+IxvhRQXwywrRqxeHC/8jGolIOIQOHh8qqOSXtLx/3/53c4CF244aV5GMRkVne7sEAMhKGpPp77cCwSBXUG7zgJ2iofwyOM4dwnVfRYYD+eG8kpCufxaBTvMAFQAUBGATSU8I0el5XgcRSAlMEIAtACVTfeMQ2dkM+TZK5SINM2bfbRgGq4jHVWPTJoVpe17hnvfjLMDbA4ieWVdHo/fsEYW9vQQAkNOUoyQwi4D9kQi6kORrBxXo0L9FCw9R/b5Zs340o7b2GTzuuM8FFSVw8DMqyX2q3+9zspkcERtbJKzxjbHqlwHglYp4/A7p4LGO138+IL+Qc1aqATtdAB3rkkgDoqrqep4QAjhjIF3X8iS5HKETPPcxXYrkuPc6njJN0zuo+4YEAJi2pnV0yg/+MIlHOcJbkWh0i3mgpZOc0dJyZoZBJUiZr0m4RiF5d0tF5b1/yiD7t2vhD9JggznQVatXHzXg0xf4dW1BIBAAO5vpti37tmLb/fGyQSF/8KhtbT0xxWXIdUgg0ckAUAYgfSpJIvQ94TCZLobcvntmzdvzQXuZsXbtJEdlJ2ZU39Mk5cR84T3kE3JOvKIicVU8XgKcXwzALkGQPoXRFrC9H2+orNx95A1pIowkk2zCX5bV/0mrVT2wbjnTfVFU1XGoKpDt7unjnP9QI0xCf/9LDfPnD8AhppDoF5d/1gPtaA1llUD2RSBACeIxAvabkIRfFHd3v9VVXHyJBJrkIXsThfLshti07YfLhPlI8wOH/H6macprV6wo4HmByxXk17gEqou4V1fYt3SuvC1JvmRnrfag520vnjDhcQCAjm3bsLew8E97G5RfAYk4UoD4HKraZCI4HUmeaQNtAkLkBO0a0S7peVtaq6p+M+hzPMEBCPXb9h+Sg51ABu/w73/hwzdD9f1vmQyDoWnKaxobT8oPh0dK7gVzA7auO/Re07w5r/y9tSrXrPmcp+CJruobYIx5uusOjJDy99+NxbL0D743kkjwRCQiD3c2F/67akMiyST7ez9gTkvj6QNcIXABgn6/ilIqqt8PrrRtnrXGOgRlunSh0MOXllRWbv5b9/G/YBYRDoYXPrJMriMRsMYh/+DWsjLsbG/Hs8aP91vCjeUU5YsETOWqmi9QQiDgV4Rlu57jpKXrrhfc2dI247quyEFtTZKHaL8drvH/KGvpXmclu/oAAAAASUVORK5CYII=';
  var SHEET_ID = '1JG7l4QcNfQLfRkW4-JgNQ2blAUtSU3gzZEZJN8LOsC8';
  var PAGE = 'https://cveleyt.github.io/aqua-calendar/';
  var MAX_ROWS = 6, CACHE_MS = 2 * 60 * 1000;
  var COLORS = {Red:'#AE4541',Orange:'#A85A18',Gold:'#8F7200',Green:'#387D4E',Teal:'#2C7C7C',Blue:'#3A6CB5',Purple:'#794DB3',Pink:'#AB4680',Brown:'#7A5230',Slate:'#556A7B'};
  var DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], MON3 = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function url(sheet, range) {
    return 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/gviz/tq?headers=0&tqx=out:csv&sheet=' + encodeURIComponent(sheet) + '&range=' + range + '&_=' + Date.now();
  }
  function get(u) {
    return new Promise(function (res, rej) {
      if (typeof GM_xmlhttpRequest === 'function') {
        GM_xmlhttpRequest({ method: 'GET', url: u, timeout: 15000, onload: function (r) { r.status === 200 ? res(r.responseText) : rej(new Error('HTTP ' + r.status)); }, onerror: function () { rej(new Error('network')); }, ontimeout: function () { rej(new Error('timeout')); } });
      } else if (typeof PDA_httpGet === 'function') {
        PDA_httpGet(u).then(function (r) { res(r.responseText); }, rej);
      } else { fetch(u).then(function (r) { return r.text(); }).then(res, rej); }
    });
  }
  function csv(t) {
    var rows = [], row = [], f = '', q = false;
    for (var i = 0; i < t.length; i++) {
      var c = t[i];
      if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
      else if (c === '"') q = true;
      else if (c === ',') { row.push(f); f = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && t[i + 1] === '\n') i++; row.push(f); rows.push(row); row = []; f = ''; }
      else f += c;
    }
    if (f !== '' || row.length) { row.push(f); rows.push(row); }
    return rows;
  }
  function dayIdx(y, m, d) { return Math.floor(Date.UTC(y, m, d) / 86400000); }
  function fmt(i) { var d = new Date(i * 86400000); return DAYS[d.getUTCDay()] + ' ' + d.getUTCDate() + ' ' + MON3[d.getUTCMonth()]; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function parse(evRows, warRows) {
    var n = new Date(), today = dayIdx(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate());
    var warPanel = warRows.filter(function (r) { return r.some(function (c) { return String(c).trim() !== ''; }); });
    var status = ((warPanel[2] || [])[0] || '').trim().toUpperCase();
    var done = status === 'CAP MET' || status === 'WAR OVER';
    var out = [];
    evRows.forEach(function (r) {
      var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((r[0] || '').trim()); if (!m) return;
      var s = dayIdx(+m[1], +m[2] - 1, +m[3]), e = s, b = /^(\d{4})-(\d{2})-(\d{2})$/.exec((r[1] || '').trim());
      if (b) { var ee = dayIdx(+b[1], +b[2] - 1, +b[3]); if (ee > s) e = ee; }
      var title = (r[2] || '').trim(), time = r[3] || '', arch = time.indexOf('​') >= 0, war = title.indexOf('⚔') === 0;
      time = time.replace(/​/g, '').trim();
      if (arch || e < today) return;
      var col = war ? (done ? COLORS.Slate : COLORS.Red) : (COLORS[(r[5] || '').trim()] || COLORS.Green);
      out.push({ s: s, e: e, title: title, time: time, host: (r[4] || '').trim(), color: col, war: war });
    });
    out.sort(function (a, b) { return a.s - b.s || a.e - b.e; });
    var teams = ((warPanel[0] || [])[0] || '').split('\n')[0], opp = ((warPanel[0] || [])[2] || '').split('\n')[0];
    return { today: today, events: out.slice(0, MAX_ROWS), war: warPanel.length ? { vs: teams + ' vs ' + opp, date: (warPanel[1] || [])[0] || '', status: status, type: (warPanel[2] || [])[1] || '' } : null };
  }
  function load(force) {
    var cached = null;
    try { cached = JSON.parse(GM_getValue('aquaCal', 'null')); } catch (e) {}
    if (!force && cached && Date.now() - cached.t < CACHE_MS) return Promise.resolve(cached.d);
    return Promise.all([get(url('Events', 'A2:F81')), get(url('Calendar', 'I4:K9'))]).then(function (a) {
      var d = parse(csv(a[0]), csv(a[1]));
      try { GM_setValue('aquaCal', JSON.stringify({ t: Date.now(), d: d })); } catch (e) {}
      return d;
    });
  }

  var css = '' +
    '#aqc-btn{position:fixed;right:14px;bottom:70px;z-index:99998;width:42px;height:42px;border-radius:50%;background:#0e2a33;border:2px solid #5fb3b3;cursor:pointer;box-shadow:0 0 0 3px rgba(95,179,179,.18),0 3px 10px rgba(0,0,0,.5);padding:0;background-repeat:no-repeat;background-position:center;background-size:84%}' +
    '#aqc-pop{--h1:#525252;--h2:#363636;--row:#333;--row2:#2e2e2e;--sep:#191919;--tx:#d6d6d6;--mut:#9a9a9a;--link:#75aee3;--gold:#e0b84a;--ok:#8fc23a;' +
    'position:fixed;right:14px;bottom:120px;z-index:99999;width:272px;max-width:calc(100vw - 28px);max-height:calc(100vh - 140px);overflow:auto;background:var(--row);border:1px solid rgba(95,179,179,.35);border-radius:6px;box-shadow:0 2px 10px rgba(0,0,0,.7);font:12px/1.25 Arial,Helvetica,sans-serif;display:none}' +
    '#aqc-pop.light{--row:#f2f2f2;--row2:#ffffff;--sep:#dddddd;--tx:#333;--mut:#777;--link:#2f6fa8;--gold:#9a6a00;--ok:#4d7a0f;box-shadow:0 2px 10px rgba(0,0,0,.35)}' +
    '#aqc-pop *{box-sizing:border-box;font-family:Arial,Helvetica,sans-serif}' +
    '#aqc-pop .ph{display:flex;align-items:center;gap:7px;height:28px;padding:0 9px;background:linear-gradient(var(--h1),var(--h2));position:relative}' +
    '#aqc-pop .ph:after{content:"";position:absolute;left:0;right:0;bottom:0;height:2px;background:linear-gradient(90deg,#1b7c80,#5fb3b3,#1b7c80)}' +
    '#aqc-pop .ph img{height:18px;width:auto;filter:brightness(1.7)}' +
    '#aqc-pop .ph .tt{flex:1;color:#fff!important;font-weight:700;font-size:13px}' +
    '#aqc-pop .tg{width:22px;height:22px;padding:0;border:0;background:transparent;color:#bbb!important;cursor:pointer;font-size:14px;line-height:1}' +
    '#aqc-pop .g{display:flex;align-items:center;gap:6px;height:23px;padding:0 9px;background:#14606a;color:#fff!important;font-weight:700;font-size:12px;border-top:1px solid rgba(255,255,255,.12)}' +
    '#aqc-pop .g:before{content:"";width:5px;height:5px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#8fe3e3}' +
    '#aqc-pop .vs{text-align:center;padding:7px 8px 2px;font-weight:700;font-size:13px;background:var(--row);color:var(--tx)!important}' +
    '#aqc-pop .vs i{font-style:normal;color:var(--gold)!important;font-size:11px;margin:0 6px}' +
    '#aqc-pop .dt{text-align:center;padding:0 8px 4px;background:var(--row);color:var(--mut)!important}' +
    '#aqc-pop .st{display:flex;gap:5px;justify-content:center;padding:4px 8px 8px;background:var(--row)}' +
    '#aqc-pop .st span{font-size:10px;font-weight:700;color:#fff!important;padding:2px 7px;border-radius:3px;background:#556a7b}' +
    '#aqc-pop .st span.up{background:#365e94}#aqc-pop .st span.on{background:#ae3a3f}#aqc-pop .st span.t{background:#bc4214}' +
    '#aqc-pop .r{display:grid;grid-template-columns:60px 1fr auto;align-items:center;min-height:26px;border-top:1px solid var(--sep);background:var(--row)}' +
    '#aqc-pop .r.alt{background:var(--row2)}' +
    '#aqc-pop .r .l{font-weight:700;padding:0 7px;border-right:1px solid var(--sep);align-self:stretch;display:flex;flex-direction:column;justify-content:center;line-height:1.15;border-left:3px solid var(--c);color:var(--tx)!important}' +
    '#aqc-pop .r .l small{font-weight:400;color:var(--mut)!important;font-size:10px}' +
    '#aqc-pop .r .v{padding:4px 8px;color:var(--tx)!important}' +
    '#aqc-pop .r .v small{display:block;color:var(--mut)!important;font-size:10.5px}' +
    '#aqc-pop .r .w{padding:0 8px;color:var(--ok)!important;font-weight:700;font-size:11px;white-space:nowrap}' +
    '#aqc-pop .m{padding:14px;text-align:center;background:var(--row);color:var(--mut)!important}' +
    '#aqc-pop .f{padding:7px;text-align:center;border-top:1px solid var(--sep);background:var(--row)}' +
    '#aqc-pop .f a{color:var(--link)!important;font-weight:700;text-decoration:none}';

  var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function ui() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var b = document.createElement('button'); b.id = 'aqc-btn'; b.style.backgroundImage = 'url(' + ICON + ')'; b.setAttribute('aria-label', 'AQUA calendar'); b.title = 'AQUA calendar: next events';
    var p = document.createElement('div'); p.id = 'aqc-pop';
    document.body.appendChild(b); document.body.appendChild(p);
    var light = false;
    try { light = GM_getValue('aquaTheme', 'dark') === 'light'; } catch (e) {}
    var last = null;
    function theme() { p.classList.toggle('light', light); }
    function chipCls(t) { t = (t || '').toUpperCase(); return t === 'UPCOMING' ? 'up' : t === 'ONGOING' ? 'on' : ''; }
    function draw(d) {
      last = d;
      var h = '<div class="ph"><img src="' + ICON + '" alt=""><span class="tt">AQUA Calendar</span><button class="tg" id="aqc-tg" title="Dark / light mode">' + (light ? '☾' : '☼') + '</button></div>';
      if (d.war) {
        var vs = d.war.vs.split(' vs ');
        h += '<div class="g">Ranked War</div><div class="vs">' + esc(vs[0]) + '<i>VS</i>' + esc(vs[1] || '') + '</div><div class="dt">' + esc(d.war.date) + '</div><div class="st">' +
          (d.war.status ? '<span class="' + chipCls(d.war.status) + '">' + esc(d.war.status) + '</span>' : '') +
          (d.war.type ? '<span class="' + (/TERMED/i.test(d.war.type) ? 't' : '') + '">' + esc(d.war.type) + '</span>' : '') + '</div>';
      }
      h += '<div class="g">Next Events</div>';
      if (!d.events.length) h += '<div class="m">No upcoming events</div>';
      d.events.forEach(function (e, i) {
        var diff = e.s - d.today, when = diff <= 0 ? 'now' : 'in ' + diff + 'd';
        var dt = new Date(e.s * 86400000), meta = [];
        if (e.e > e.s) meta.push('to ' + fmt(e.e));
        if (e.time) meta.push(e.time);
        if (e.host && !e.war) meta.push('Host: ' + e.host);
        h += '<div class="r' + (i % 2 ? ' alt' : '') + '"><div class="l" style="--c:' + e.color + '">' + dt.getUTCDate() + ' ' + MON[dt.getUTCMonth()] + '<small>' + DAYS[dt.getUTCDay()] + '</small></div><div class="v">' + esc(e.title) + (meta.length ? '<small>' + esc(meta.join(' | ')) + '</small>' : '') + '</div><div class="w">' + when + '</div></div>';
      });
      h += '<div class="f"><a href="' + PAGE + '" target="_blank" rel="noopener">Open full calendar</a></div>';
      p.innerHTML = h; theme();
    }
    function open() {
      p.style.display = 'block'; theme(); p.innerHTML = '<div class="m">Loading...</div>';
      load(false).then(draw, function (e) { p.innerHTML = '<div class="m">Could not load the calendar (' + esc(e.message) + ')</div>'; });
    }
    p.addEventListener('click', function (ev) {
      ev.stopPropagation();
      if (ev.target && ev.target.id === 'aqc-tg') { light = !light; try { GM_setValue('aquaTheme', light ? 'light' : 'dark'); } catch (e) {} if (last) draw(last); else theme(); }
    });
    b.addEventListener('click', function (ev) { ev.stopPropagation(); if (p.style.display === 'block') p.style.display = 'none'; else open(); });
    document.addEventListener('click', function (ev) { if (p.style.display === 'block' && !p.contains(ev.target) && ev.target !== b) p.style.display = 'none'; });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') p.style.display = 'none'; });
  }
  if (document.body) ui(); else document.addEventListener('DOMContentLoaded', ui);

  window.__aquaParse = parse; window.__aquaCsv = csv;
})();
