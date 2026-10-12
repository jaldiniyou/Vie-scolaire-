import numpy as np, soundfile as sf, json
SRC="/root/.claude/uploads/c7b9b2db-6537-50ca-af16-197d20915c48/3c3b3ace-Generated_Audio_October_12_2026_-_2_04PM.wav"
x,sr=sf.read(SRC,dtype="float32")
P=0.05
speech=[(0.351,1.890),(2.678,7.400),(8.037,10.576),(10.930,14.485),(15.138,21.536),(22.236,28.844),(29.474,33.188),(33.835,36.139),(36.434,38.724),(39.074,40.550),(41.191,41.829),(42.109,43.084),(43.509,44.499),(45.239,47.807)]
gaps=[0.34,0.18,0.08,0.18,0.18,0.17,0.13,0.04,0.11,0.13,0.02,0.05,0.22]
LEAD,TAIL=0.25,0.85
out=[np.zeros(int(LEAD*sr),np.float32)]; t=LEAD; tl=[]
for i,(a,b) in enumerate(speech):
    seg=x[int((a-P)*sr):int(min(b+P,len(x)/sr)*sr)].copy()
    f=int(0.012*sr); seg[:f]*=np.linspace(0,1,f); seg[-f:]*=np.linspace(1,0,f)
    tl.append([t+P,t+len(seg)/sr-P]); out.append(seg); t+=len(seg)/sr
    if i<len(gaps): out.append(np.zeros(int(gaps[i]*sr),np.float32)); t+=gaps[i]
out.append(np.zeros(int(TAIL*sr),np.float32))
v=np.concatenate(out); D=len(v)/sr
print("duration",D); json.dump({"dur":D,"seg":tl},open("timeline.json","w"),indent=1)
# ---- music + sfx at 48k
R=48000; n=int(D*R); tt=np.arange(n)/R
vr=np.interp(np.arange(n)/R, np.arange(len(v))/sr, v)
def lp(sig,cut):  # fft lowpass
    S=np.fft.rfft(sig); fr=np.fft.rfftfreq(len(sig),1/R); S*=1/(1+(fr/cut)**4); return np.fft.irfft(S,len(sig))
def bp(sig,lo,hi):
    S=np.fft.rfft(sig); fr=np.fft.rfftfreq(len(sig),1/R); S*=((fr>lo)&(fr<hi)); return np.fft.irfft(S,len(sig))
rng=np.random.default_rng(3)
# chord pad: Am9 -> Fmaj7 -> Cmaj7 -> Gsus, 6s each
chords=[[57,60,64,67,71],[53,57,60,64,69],[48,55,59,64,67],[55,57,62,67,71]]
mus=np.zeros(n)
for k in range(int(D/6)+2):
    c=chords[k%4]; s0=k*6.0
    env=np.clip((tt-s0)/2.0,0,1)*np.clip((s0+7.5-tt)/2.0,0,1)
    if env.max()==0: continue
    for m in c:
        f=440*2**((m-69)/12)
        for det in (-0.12,0.12):
            mus+=env*np.sin(2*np.pi*f*(1+det/100)*tt+rng.random()*6)*0.05
    mus+=env*np.sin(2*np.pi*440*2**((c[0]-12-69)/12)*tt)*0.09
mus*=0.8+0.2*np.sin(2*np.pi*0.25*tt)
# soft pulse (kick-ish) from 8s to end, 96bpm
beat=60/96; pulse=np.zeros(n)
for b in np.arange(8.0,D-2.5,beat*2):
    i=int(b*R); L=int(0.35*R); e=np.exp(-np.arange(L)/R*12)
    pulse[i:i+L]+=np.sin(2*np.pi*(48+60*np.exp(-np.arange(L)/R*30))*np.arange(L)/R)[:n-i]*e[:n-i]*0.35
mus=lp(mus,2500)+pulse
cuts=[s[0] for s in tl]
sfx=np.zeros(n)
def whoosh(t0,dur=0.6,amp=0.25,lo=300,hi=5000):
    i=int((t0-dur*0.7)*R); L=int(dur*R)
    if i<0: i=0
    w=bp(rng.standard_normal(L),lo,hi); e=np.sin(np.linspace(0,np.pi,L))**2
    sfx[i:i+L]+=(w*e*amp)[:n-i]
def paper(t0,amp=0.12):
    i=int(t0*R); L=int(0.18*R)
    w=bp(rng.standard_normal(L)*(rng.random(L)>0.6),1500,9000)*np.exp(-np.arange(L)/R*18)
    sfx[i:i+L]+=(w*amp)[:n-i]
def boom(t0,amp=0.6):
    i=int(t0*R); L=int(2.2*R); a=np.arange(L)/R
    s=np.sin(2*np.pi*(40+50*np.exp(-a*8))*a)*np.exp(-a*2.2)+bp(rng.standard_normal(L),80,600)*np.exp(-a*6)*0.4
    sfx[i:i+L]+=(s*amp)[:n-i]
for c in [tl[1][0],tl[2][0],tl[4][0],tl[5][0],tl[6][0],tl[7][0]]: whoosh(c)
for c in [0.35,0.8,1.3,tl[0][1]+0.05]+[s[0]+0.3 for s in tl[1:9]]: paper(c)
# riser into logo
i0=int((tl[9][0]-1.6)*R); L=int(1.6*R)
r=bp(rng.standard_normal(L),500,8000)*np.linspace(0,1,L)**2*0.2; sfx[i0:i0+L]+=r
boom(tl[9][0]-0.05)
# duck
env=np.abs(vr); k=int(0.15*R); env=np.convolve(env,np.ones(k)/k,'same'); env=env/env.max()
duck=1-0.55*np.clip(env*4,0,1)
fade=np.clip(tt/1.0,0,1)*np.clip((D-tt)/1.2,0,1)
mix=vr*1.0+ (mus*0.22*duck + sfx*0.5*(0.6+0.4*duck))*fade
mix=mix/np.max(np.abs(mix))*0.93
sf.write("mix.wav",mix.astype(np.float32),R)
