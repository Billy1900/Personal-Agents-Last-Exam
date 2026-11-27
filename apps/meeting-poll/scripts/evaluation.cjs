'use strict';
// Original synthetic business records, generated through the App's domain transitions.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {action}=require('../src/operations.cjs'),{validateSeed}=require('../src/model.cjs');
const root=path.resolve(__dirname,'..'),dest=path.join(root,'evaluation'),seed=1792026;
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const themes=[['Quarterly roadmap','Agree delivery priorities and preserve the engineering lead attendance.'],['Customer onboarding','Review the fictional Cedar account handover with support and delivery.'],['Accessibility review','Compare keyboard navigation findings before the release decision.'],['Incident follow-up','Agree owners for recovery actions without sharing customer records.'],['Research synthesis','Discuss conflicting interview findings with design and research.'],['Budget planning','Review internal resourcing assumptions with the project team.'],['Release readiness','Check outstanding verification work and agree the launch review.'],['Partner workshop','Coordinate the fictional Juniper integration workshop across time zones.']];
function build(){let rng=seed;const random=()=>((rng=(Math.imul(rng,1664525)+1013904223)>>>0)/4294967296);const partitions=[];
 for(let y=2025;y<=2026;y++)for(let m=0;m<12;m++){
  const month=`${y}-${String(m+1).padStart(2,'0')}`,binding=structuredClone(require('../fixtures/binding.json'));
  let data={account_id:'poll-maya',owner_person_id:'person-maya',polls:[],notifications:[]};
  const ctx={app_id:'meeting-poll',role:'infra',binding,virtual_now:''};
  const stamp=(day,hour=16)=>new Date(Date.UTC(y,m,day,hour)).toISOString();
  for(let i=0;i<8;i++){
   const day=1+i*3,organizer=i===7?'person-jules':i%3===0?'person-alex':'person-maya';
   const participants=i===7?['person-jules','person-sam']:i%2?['person-maya','person-alex','person-jules']:['person-maya','person-alex','person-sam'];
   let minute=0;const call=(actor,name,args)=>{ctx.virtual_now=new Date(Date.UTC(y,m,day,16,minute++)).toISOString();const out=action(ctx,data,actor,name,args);data=out.data;return out.result;};
   const slots=[0,1,2].map((n)=>({start:stamp(day+3+n,16+i%3),end:new Date(Date.parse(stamp(day+3+n,16+i%3))+(i%2?60:30)*60000).toISOString(),timezone:['America/Los_Angeles','Europe/London','Asia/Shanghai'][(n+i)%3]}));
   // December's last candidate includes the end boundary without inventing historical activity.
   if(m===11&&i===7){slots[2].start=stamp(31,16);slots[2].end=stamp(31,17);}
   const {id}=call(organizer,'create',{title:`${month} ${themes[i][0]}`,description:themes[i][1]+` Planning cycle ${1+(y-2025)*12+m}.`,location:i%2?'Video room':'Project room '+(i%3+1),participant_ids:participants,deadline:stamp(day+2),slots});
   if(i===0)continue; // a private unfinished draft
   call(organizer,'publish',{id});
   const votes=()=>data.polls.at(-1).slots.filter(s=>s.active).map(s=>({slot_id:s.id,value:['yes','if-needed','no'][Math.floor(random()*3)]}));
   for(const person of participants)call(person,'respond',{id,votes:votes()});
   if(i===2){call(participants[0],'withdraw',{id});call(participants[0],'respond',{id,votes:votes()});}
   if(i===3)call(organizer,'edit',{id,patch:{remove_slot_ids:['slot-1'],add_slots:[{...slots[0],start:stamp(day+6),end:stamp(day+6,17)}]}});
   if([1,4,5,6,7].includes(i))call(organizer,'finalize',{id,slot_id:'slot-2'});
   if(i===4){call(organizer,'reopen',{id,deadline:stamp(day+2),reason:'Required participant reported a conflict.'});call(participants[0],'respond',{id,votes:votes()});call(organizer,'finalize',{id,slot_id:'slot-3'});}
   if(i===5)call(organizer,'cancel',{id,reason:'Workshop postponed until the next planning cycle.'});
  }
  // Partition-scoped stable IDs avoid collisions when reports combine months.
  const ids=new Map(data.polls.map(p=>[p.id,month+'-'+p.id]));for(const p of data.polls)p.id=ids.get(p.id);for(const n of data.notifications){n.poll_id=ids.get(n.poll_id);n.id=month+'-'+n.id;}
  binding.objects['meeting-poll']=data.polls.map(p=>p.id);ctx.virtual_now=new Date(Date.UTC(y,m+1,0,23,59,59)).toISOString();validateSeed(ctx,data);
  partitions.push({month,virtual_now:ctx.virtual_now,binding,data});
 }
 return partitions;
}
function records(part){const rows=[];const add=(type,id,at)=>rows.push({type,id,at,provenance:'synthetic'});for(const p of part.data.polls){add('poll',p.id,p.created_at);for(const s of p.slots)add('slot',p.id+'/'+s.id,s.start);for(const type of ['responses','history','meetings'])p[type].forEach((r,i)=>add(type,p.id+'/'+type+'/'+(r.id||i),r.at));}for(const n of part.data.notifications)add('notification',n.id,n.at);return rows;}
function coverage(parts){const rows=parts.flatMap(records),valid=[],excluded=[];for(const r of rows){if(!Number.isFinite(Date.parse(r.at))){excluded.push({...r,reason:'invalid date'});continue;}const date=new Date(r.at).toISOString().slice(0,10);if(date<'2025-01-01'||date>'2026-12-31')excluded.push({...r,reason:'outside window'});else valid.push({...r,date});}
 const dates=[...new Set(valid.map(r=>r.date))].sort(),byType={};for(const type of [...new Set(rows.map(r=>r.type))]){const a=valid.filter(r=>r.type===type);byType[type]={records:a.length,distinct_dates:new Set(a.map(r=>r.date)).size};}
 const days=[];for(let d=Date.parse('2025-01-01');d<=Date.parse('2026-12-31');d+=86400000)days.push(new Date(d).toISOString().slice(0,10));
 return {timezone:'Etc/UTC',window:['2025-01-01','2026-12-31'],total_records:rows.length,included_records:valid.length,distinct_dates:dates.length,earliest:dates[0],latest:dates.at(-1),sources:byType,monthly:parts.map(p=>({month:p.month,polls:p.data.polls.length,records:valid.filter(r=>r.date.startsWith(p.month)).length,distinct_dates:dates.filter(d=>d.startsWith(p.month)).length,real:0,synthetic:valid.filter(r=>r.date.startsWith(p.month)).length})),date_breakdown:dates.map(date=>({date,records:valid.filter(r=>r.date===date).length})),gaps:days.filter(d=>!dates.includes(d)),excluded};}
function main(){const check=process.argv.includes('--check'),parts=build(),files=new Map(parts.map(p=>[p.month+'.json',JSON.stringify(p,null,2)+'\n']));
 const manifest={version:1,seed,provenance:'entirely synthetic; no observed private Doodle records',approved_scope:'452314ca5bc7e73132496362cf7c2ab19b540e11',generator_sha256:hash(fs.readFileSync(__filename)),reference_urls:['https://help.doodle.com/en/articles/9457353-how-do-i-create-a-group-poll','https://help.doodle.com/en/articles/9457279-how-do-i-participate-in-a-group-poll'],references_role:'Workflow documentation only; not a source of historical poll records. See evidence reference capture log.',partitions:[...files].map(([file,bytes])=>({file,sha256:hash(bytes),provenance:'synthetic'}))};files.set('manifest.json',JSON.stringify(manifest,null,2)+'\n');
 if(!check)fs.mkdirSync(dest,{recursive:true});for(const [file,bytes]of files){const p=path.join(dest,file);if(check){if(fs.readFileSync(p,'utf8')!==bytes)throw Error('Dataset drift: '+file);}else fs.writeFileSync(p,bytes);}
 // Count bytes read from the delivery, not a separate intended date list.
 const delivered=manifest.partitions.map(p=>JSON.parse(fs.readFileSync(path.join(dest,p.file))));const report=JSON.stringify({...coverage(delivered),dataset_files:manifest.partitions},null,2)+'\n';const target=path.join(dest,'coverage.json');if(check){if(fs.readFileSync(target,'utf8')!==report)throw Error('Coverage drift');}else fs.writeFileSync(target,report);console.log(JSON.stringify({partitions:parts.length,polls:parts.flatMap(p=>p.data.polls).length,...((({distinct_dates,earliest,latest})=>({distinct_dates,earliest,latest}))(coverage(delivered)))}));
}
module.exports={build,records,coverage,hash};if(require.main===module)main();
