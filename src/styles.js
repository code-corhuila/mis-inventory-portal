export default `
:host{display:block;color:#172a3b;font-family:Arial,sans-serif;letter-spacing:0}*{box-sizing:border-box}
h1{font-size:24px;margin:0}h2{font-size:19px;margin:0;overflow-wrap:anywhere}.eyebrow{font-size:11px;color:#0d655b;font-weight:700;margin:0 0 7px}
.heading,.modes,.pagination{display:flex;gap:12px;align-items:center}.heading{justify-content:space-between;flex-wrap:wrap;border-bottom:1px solid #dbe3ee;padding-bottom:20px;margin-bottom:24px}
button{min-height:40px;padding:8px 14px;border:1px solid #c5d1de;border-radius:6px;background:white;color:#243c45;cursor:pointer;font:inherit;font-size:14px;flex-shrink:0;max-width:100%;white-space:normal}
button:disabled{opacity:.5;cursor:default}button:hover:not(:disabled){background:#edf3fa}:focus-visible{outline:3px solid #187dca;outline-offset:2px}
form>button[type=submit]{background:#2563eb;border-color:#2563eb;color:white}form>button[type=submit]:hover:not(:disabled){background:#1d4ed8}
.modes{border-bottom:1px solid #dbe3ee;margin-bottom:24px}.modes button{border:0;border-radius:0;border-bottom:3px solid transparent;background:none}.modes [aria-selected=true]{border-color:#2563eb;color:#1d4ed8}
form{display:flex;flex-wrap:wrap;gap:16px;align-items:flex-end;margin-bottom:24px}label{display:grid;gap:8px;font-size:13px;font-weight:600;min-width:0}label:first-child{flex:1;min-width:200px}
input,select{min-width:0;width:100%;height:44px;padding:10px 12px;border:1px solid #a7b9ca;border-radius:6px;background:white;color:inherit;font:inherit;font-size:14px}input:disabled,select:disabled{background:#edf1f5;color:#637486}
.summary,small,dt{color:#637486}.summary{font-size:13px;margin:20px 0 12px}.table-scroll{overflow:auto;background:white;border:1px solid #dbe3ee;border-radius:6px}
table{width:100%;min-width:900px;table-layout:fixed;border-collapse:collapse;text-align:left;font-size:13px}th{background:#edf2f8;color:#3d4e68;font-weight:600}th:first-child{width:30%}th:last-child{width:14%}
th,td{padding:13px 14px;border-bottom:1px solid #e2e8f0;vertical-align:top;overflow-wrap:anywhere}tbody tr:last-child td{border-bottom:0}tbody tr:hover{background:#f8fafc}small{display:block;margin-top:5px;line-height:1.5}
.expired,[role=alert]{color:#b42335}[role=alert]{line-height:1.5}[role=alert]:empty{display:none}
.pagination{justify-content:flex-end;flex-wrap:wrap;margin:18px 0;font-size:13px}.detail{border-top:1px solid #dbe3ee;padding-top:24px;margin-top:24px}.detail .heading{margin-bottom:16px}.detail h2{margin-bottom:16px}
dt{font-size:12px;margin-top:14px}dd{margin:6px 0;overflow-wrap:anywhere;font-size:14px;line-height:1.5}.lot-actions{display:grid;gap:8px}.success{color:#15803d}
.exit-form{display:grid;grid-template-columns:minmax(100px,.6fr) minmax(0,2fr);align-items:end;gap:18px}.exit-form label:first-child{min-width:0}.exit-form>button{justify-self:end;width:100%}
@media(max-width:800px){form{display:grid;grid-template-columns:minmax(0,1fr)}label:first-child{min-width:0}.exit-form{grid-template-columns:minmax(0,1fr)}.pagination{justify-content:space-between;gap:8px}.pagination span{font-size:12px}.pagination button{padding:8px 10px}}
`;
