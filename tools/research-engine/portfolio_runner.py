#!/usr/bin/env python3
import argparse, json, os, subprocess, sys
from pathlib import Path

def load(path):
    x=json.loads(Path(path).read_text())
    return x.get('repositories',x) if isinstance(x,dict) else x

def main():
    p=argparse.ArgumentParser(); p.add_argument('--manifest',required=True); p.add_argument('--out',default='generated-portfolio'); p.add_argument('--engine',default=str(Path(__file__).with_name('research_engine.py'))); p.add_argument('--max-candidates',type=int,default=200); a=p.parse_args()
    rows=load(a.manifest); names={r.get('name',r.get('repo')) for r in rows}; reports=[]; errors=[]
    for r in rows:
        name=r.get('name',r.get('repo')); typ=r.get('type','awesome'); niche=r['niche']; pair=r.get('pair')
        if pair and pair not in names: errors.append(f'{name}: missing pair {pair}')
        dest=Path(a.out)/name
        if typ=='awesome':
            cmd=[sys.executable,a.engine,'--repo',name,'--niche',niche,'--target',str(r.get('target',r.get('targetProjects',50))),'--max-candidates',str(a.max_candidates),'--out',str(dest)]
            cp=subprocess.run(cmd,text=True,capture_output=True)
            reports.append({'repo':name,'type':typ,'returncode':cp.returncode,'stdout':cp.stdout[-1000:],'stderr':cp.stderr[-1000:]})
        else:
            (dest/'recipes').mkdir(parents=True,exist_ok=True)
            (dest/'README.md').write_text(f'# {niche.title()} Cookbook\n\nExecutable reference patterns for **{niche}**.\n\nPaired landscape: https://github.com/CodesbyFebin/{pair}\n\n## Recipes\n\n- `001-minimal-working` — executable baseline with tests.\n- `002-validation-boundary` — fail-closed input validation.\n- `003-observability` — structured execution evidence.\n')
            recipes=[('001-minimal-working','return {"status":"ok","input":payload}'),('002-validation-boundary','\n    if set(payload)-{"action","value"}: raise ValueError("unknown fields")\n    if payload.get("action") != "process": raise ValueError("unsupported action")\n    return {"status":"accepted","value":payload.get("value")}'),('003-observability','\n    import uuid, time\n    return {"status":"ok","request_id":str(uuid.uuid4()),"timestamp":time.time()}')]
            for slug,body in recipes:
                d=dest/'recipes'/slug/'tests'; d.mkdir(parents=True,exist_ok=True)
                code='def execute(payload: dict) -> dict:\n    if not isinstance(payload, dict): raise TypeError("payload must be a dict")\n    '+body.strip()+'\n\nif __name__ == "__main__":\n    print(execute({"action":"process","value":"demo"}))\n'
                (d.parent/'main.py').write_text(code)
                (d.parent/'README.md').write_text(f'# {slug}\n\n## Run\n```bash\npython main.py\n```\n\n## Test\n```bash\npython -m unittest discover -s tests -v\n```\n\n## Security\nReference pattern only; add domain authentication, authorization, isolation and secret management before production use.\n')
                (d/'test_recipe.py').write_text('import importlib.util,pathlib,unittest\nP=pathlib.Path(__file__).parents[1]/"main.py"; s=importlib.util.spec_from_file_location("r",P); m=importlib.util.module_from_spec(s); s.loader.exec_module(m)\nclass T(unittest.TestCase):\n def test_type(self):\n  with self.assertRaises(TypeError): m.execute("bad")\nif __name__=="__main__": unittest.main()\n')
            (dest/'AGENTS.md').write_text(f'# Agent instructions\n\nScope: {niche}. Preserve evidence boundaries and do not invent capabilities.\n')
            (dest/'llms.txt').write_text(f'# {name}\nPurpose: {niche} cookbook\nPair: {pair}\nOwner: https://github.com/CodesbyFebin\n')
            (dest/'quality-report.json').write_text(json.dumps({'repo':name,'type':typ,'sample_recipes':3,'status':'NEEDS_DOMAIN_IMPLEMENTATION'},indent=2))
            reports.append({'repo':name,'type':typ,'returncode':0})
        if pair:
            eco=dest/'docs'; eco.mkdir(parents=True,exist_ok=True); (eco/'ECOSYSTEM.md').write_text(f'# Ecosystem\n\nPaired repository: https://github.com/CodesbyFebin/{pair}\n')
    Path(a.out).mkdir(parents=True,exist_ok=True); (Path(a.out)/'portfolio-report.json').write_text(json.dumps({'repositories':reports,'cross_link_errors':errors},indent=2))
    print(json.dumps({'processed':len(rows),'errors':errors,'output':a.out},indent=2))
if __name__=='__main__': main()
