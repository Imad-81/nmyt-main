from PIL import Image; import numpy as np, cv2
C=np.asarray(Image.open('logo-original.png').convert('RGB')).astype(np.float32)
C[:3,:]=254
h,w,_=C.shape
sat=C.max(2)-C.min(2); lum=C.mean(2)
cand=((lum>95)&(sat<=np.where(lum>222,7,22))).astype(np.uint8)
ell=cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(5,5))
opened=cv2.morphologyEx(cand,cv2.MORPH_OPEN,ell)
n,lab=cv2.connectedComponents(opened,connectivity=4)
border=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
bg=np.isin(lab,list(border)).astype(np.uint8)
# geodesic regrow (2px) inside candidate pixels to recover real edge background
for _ in range(2):
    bg=(cv2.dilate(bg,np.ones((3,3),np.uint8))&cand).astype(np.uint8)|bg
fg=1-bg
n2,l2,st,_=cv2.connectedComponentsWithStats(fg,connectivity=8)
keep=np.zeros_like(fg)
for i in range(1,n2):
    if st[i,4]>300: keep[l2==i]=1
fg=keep; bg=1-fg
k=np.ones((3,3),np.uint8)
fg_core=cv2.erode(fg,k,iterations=2)
bg_core=cv2.erode(bg,k,iterations=2)
band=((fg_core==0)&(bg_core==0)).astype(np.uint8)
C8=C.astype(np.uint8)
F=cv2.inpaint(C8,(1-fg_core).astype(np.uint8),5,cv2.INPAINT_TELEA).astype(np.float32)
B=cv2.inpaint(C8,(1-bg_core).astype(np.uint8),5,cv2.INPAINT_TELEA).astype(np.float32)
d=F-B; num=((C-B)*d).sum(2); den=(d*d).sum(2)+1e-3
al=np.clip(num/den,0,1)
alpha=np.where(fg_core==1,1.0,np.where(band==1,al,0.0))
alpha=np.where((band==1)&(den<400),fg.astype(np.float32),alpha)
col=np.where((band==1)[...,None],F,C)
col=np.where((fg_core==1)[...,None],C,col)
rgba=np.dstack([np.clip(col,0,255),alpha*255]).astype(np.uint8)
ys,xs=np.where(alpha>0.02); x0,x1,y0,y1=xs.min(),xs.max(),ys.min(),ys.max(); print('bbox',x0,x1,y0,y1)
pad=4; crop=rgba[y0-pad:y1+pad+1,x0-pad:x1+pad+1]
Image.fromarray(crop).save('nmyt-logo-v3.png')
Image.fromarray((fg[y0-pad:y1+pad+1,x0-pad:x1+pad+1]*255).astype(np.uint8)).save('mask-v3.png')
o=Image.open('logo-original.png').convert('RGB'); box=(571,290,651,370)
v=Image.fromarray(crop); bgi=Image.new('RGBA',v.size,(255,0,255,255)); bgi.alpha_composite(v)
b2=(box[0]-(x0-pad),box[1]-(y0-pad),box[2]-(x0-pad),box[3]-(y0-pad))
S=Image.new('RGB',(970,480)); S.paste(o.crop(box).resize((480,480),Image.NEAREST),(0,0)); S.paste(bgi.crop(b2).convert('RGB').resize((480,480),Image.NEAREST),(490,0)); S.save('notch3.png')
a=crop.astype(float); al3=a[...,3:4]/255
Image.fromarray((a[...,:3]*al3+np.array([3,4,8])*(1-al3)).astype(np.uint8)).save('prev3-black.png')
Image.fromarray((a[...,:3]*al3+np.array([255,255,255])*(1-al3)).astype(np.uint8)).save('prev3-white.png')

b=Image.fromarray((a[...,:3]*al3+np.array([3,4,8])*(1-al3)).astype(np.uint8)); wt=Image.fromarray((a[...,:3]*al3+np.array([255,255,255])*(1-al3)).astype(np.uint8))
crops=[(0,200,220,327),(330,60,560,260),(640,0,878,120),(560,200,800,327)]
tiles=[]
for c in crops:
    for src in (b,wt):
        t=src.crop(c); tiles.append(t.resize((t.width*3,t.height*3),Image.NEAREST))
Wt=max(t.width for t in tiles); Ht=sum(t.height for t in tiles[::2])
S=Image.new('RGB',(Wt*2+10,Ht+40),(128,0,128)); y=0
for i in range(0,len(tiles),2):
    S.paste(tiles[i],(0,y)); S.paste(tiles[i+1],(Wt+10,y)); y+=tiles[i].height+10
S.save('inspect3.png')
