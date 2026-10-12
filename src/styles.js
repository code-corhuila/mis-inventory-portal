export default `
:host{display:block;color:#182b32;font-family:Arial,sans-serif;letter-spacing:0}*{box-sizing:border-box}
h1{font-size:28px;margin:0}h2{font-size:20px;margin:0;overflow-wrap:anywhere}.eyebrow{font-size:12px;color:#0d655b;font-weight:700;margin:0 0 8px}
.heading,.modes,.pagination{display:flex;gap:12px;align-items:center}.heading{justify-content:space-between;margin-bottom:24px}
button{min-height:40px;padding:8px 12px;border:1px solid #91a7b0;border-radius:4px;background:white;color:#243c45;cursor:pointer;font:inherit;flex-shrink:0}
button:disabled{opacity:.45;cursor:default}button:hover:not(:disabled){background:#e8f4f1}:focus-visible{outline:3px solid #187dca;outline-offset:2px}
.modes{border-bottom:1px solid #d8e1e4;margin-bottom:24px}.modes button{border:0;border-radius:0;border-bottom:3px solid transparent;background:none}.modes [aria-selected=true]{border-color:#0d655b;color:#0d655b}
form{display:flex;flex-wrap:wrap;gap:16px;align-items:flex-end;margin-bottom:24px}label{display:grid;gap:8px;font-size:14px;min-width:0}label:first-child{flex:1;min-width:200px}
input,select{min-width:0;width:100%;height:44px;padding:8px 10px;border:1px solid #91a7b0;border-radius:4px;background:white;color:inherit;font:inherit}
.summary,small,dt{color:#536770}.table-scroll{overflow:auto}table{width:100%;table-layout:fixed;border-collapse:collapse;text-align:left;font-size:14px}
th{background:#e9eef0}th:first-child{width:32%}th,td{padding:14px 10px;border-bottom:1px solid #d8e1e4;vertical-align:top;overflow-wrap:anywhere}small{display:block;margin-top:6px}.expired,[role=alert]{color:#a72a3e}
.pagination{justify-content:flex-end;margin:20px 0;font-size:14px}.detail{border-top:2px solid #b9cecb;padding-top:24px;margin-top:28px}dt{font-size:13px;margin-top:14px}dd{margin:6px 0;overflow-wrap:anywhere}
.lot-actions{display:grid;gap:8px}.success{color:#0d655b}.exit-form{display:grid;grid-template-columns:minmax(100px,.6fr) minmax(0,2fr) auto auto}.exit-form label:first-child{min-width:0}.detail h2{margin-bottom:16px}
@media(max-width:600px){form{display:grid;grid-template-columns:minmax(0,1fr)}label:first-child{min-width:0}table{min-width:840px}.pagination{justify-content:space-between;gap:6px}.pagination span{font-size:12px}.pagination button{padding:8px}}
@media(max-width:600px){.exit-form{grid-template-columns:minmax(0,1fr)}}
`;
