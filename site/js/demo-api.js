/* Browser-only GitHub Pages demo. NO server or secure authentication. */
(()=>{'use strict';
const KEY='restaurant_demo_v1';
const seed={users:[],current:null,carts:{},orders:[],feedback:[],responses:[],nextId:1};
let db;try{db=JSON.parse(localStorage.getItem(KEY))||structuredClone(seed)}catch(e){db=structuredClone(seed)};
const save=()=>localStorage.setItem(KEY,JSON.stringify(db));
const products=[
{product_id:1,name:'Chicken Rice',description:'Tender chicken served with fragrant rice',price:6.5,category:'Rice',is_available:true},
{product_id:2,name:'Beef Burger',description:'Grilled beef patty with fresh vegetables',price:11.9,category:'Western',is_available:true},
{product_id:3,name:'Fish and Chips',description:'Crispy battered fish with fries',price:13.5,category:'Western',is_available:true},
{product_id:4,name:'Vegetable Noodles',description:'Stir-fried noodles with vegetables',price:7.2,category:'Noodles',is_available:true},
{product_id:5,name:'Iced Lemon Tea',description:'Refreshing lemon tea',price:2.5,category:'Drinks',is_available:true},
{product_id:6,name:'Chocolate Cake',description:'Rich chocolate cake slice',price:5.9,category:'Desserts',is_available:true},
{product_id:7,name:'Nasi Lemak',description:'Coconut rice with egg and sambal',price:8.5,category:'Rice',is_available:true},
{product_id:8,name:'Seasonal Special',description:'Currently unavailable item',price:9.9,category:'Specials',is_available:false}
].map(p=>({...p,created_at:'2026-08-01T12:00:00Z'}));
const routes={'/':'index.html','/login':'login.html','/register':'register.html','/logout':'login.html','/dashboard':'dashboard.html','/member/products':'products.html','/member/product-detail':'product-detail.html','/member/my-feedback':'my-feedback.html','/cart/create':'cart/create.html','/cart/retrieve/all':'cart/retrieve-all.html','/checkout':'checkout.html'};
window.demoPath=(path)=>{let u=String(path||'/login');const [p,q]=u.split('?');const curr=location.pathname.split('/');curr.pop();if(curr[curr.length-1]==='cart')curr.pop();return curr.join('/')+'/'+(routes[p]||'login.html')+(q?'?'+q:'')};
function current(){return db.users.find(u=>u.member_id===db.current)||null}
function cart(){let id=db.current||'guest';return db.carts[id]||(db.carts[id]=[])}
function cartItems(){return cart().map(i=>({...i,product:products.find(p=>p.product_id===i.productId)})).filter(i=>i.product)}
function total(){let a=cartItems();return {total_quantity:a.reduce((s,i)=>s+i.quantity,0),total_checkout_price:a.reduce((s,i)=>s+i.product.price*i.quantity,0)}}
function checkout(){let a=cartItems();let items=a.map(i=>{let sub=Number((i.quantity*i.product.price).toFixed(2));let pct=i.quantity>=3?5:0;let discount=Number((sub*pct/100).toFixed(2));return {product_name:i.product.name,quantity:i.quantity,unit_price:i.product.price,line_subtotal:sub,discount_percent_applied:pct,line_discount_amount:discount,line_total:Number((sub-discount).toFixed(2))}});let subtotal=Number(items.reduce((a,b)=>a+b.line_subtotal,0).toFixed(2)), pd=Number(items.reduce((a,b)=>a+b.line_discount_amount,0).toFixed(2));let cp=(subtotal-pd)>=50?10:0,cd=Number(((subtotal-pd)*cp/100).toFixed(2));let fee=(subtotal-pd-cd)>=30?0:4;return {items,items_subtotal:subtotal,product_discount_total:pd,cart_value_discount_percent:cp,cart_value_discount_amount:cd,delivery_fee:fee,final_total:Number((subtotal-pd-cd+fee).toFixed(2))}}
function resp(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}})}
function error(message,status=400){return resp({success:false,message},status)}
const originalFetch=window.fetch.bind(window);
window.fetch=async(input,init={})=>{
 const str=typeof input==='string'?input:input.url;let u;try{u=new URL(str,location.href)}catch(e){return originalFetch(input,init)};
 if(u.origin!==location.origin)return originalFetch(input,init);
 const path=u.pathname;const method=(init.method||'GET').toUpperCase();let data={};try{data=JSON.parse(init.body||'{}')}catch(e){}
 let m;
 if(path==='/register'&&method==='POST'){
  if(!data.email||!data.password||!data.username||!data.first_name||!data.last_name)return resp({success:false,message:'All fields are required'});
  if(db.users.some(x=>x.email.toLowerCase()===data.email.toLowerCase()))return resp({success:false,message:'Email already registered'});
  const member_id=db.nextId++; db.users.push({...data,member_id,role:'USER'});db.current=member_id;save();return resp({success:true,redirectUrl:'/member/products'});
 }
 if(path==='/login'&&method==='POST'){
  const usr=db.users.find(x=>x.email===data.email&&x.password===data.password);
  if(!usr)return resp({success:false,message:'Invalid email or password. Register a demo account first.'});db.current=usr.member_id;save();return resp({success:true,redirectUrl:'/member/products',user:{id:usr.member_id,name:usr.username,role:usr.role}});
 }
 if(path==='/api/auth/status')return resp({authenticated:!!current(),user:current()?{id:current().member_id,name:current().username,role:'USER'}:null});
 if(path==='/products'&&method==='GET')return resp({success:true,products});
 if(path==='/products/categories')return resp({success:true,categories:[...new Set(products.map(x=>x.category))]});
 if((m=path.match(/^\/products\/(\d+)$/)))return resp({success:true,product:products.find(x=>x.product_id==+m[1])||null});
 if(path==='/cart'&&method==='GET')return resp({items:cartItems()});
 if(path==='/cart/summary')return resp(total());
 if(path==='/cart'&&method==='POST'){
  let id=+data.product_id,qty=+data.quantity,p=products.find(x=>x.product_id===id);
  if(!p||!p.is_available||!Number.isInteger(qty)||qty<1)return error('Invalid product or quantity');
  const item=cart().find(x=>x.productId===id);if(item)item.quantity+=qty;else cart().push({cartItemId:db.nextId++,productId:id,quantity:qty});save();return resp({message:'Item added to cart'});
 }
 if((m=path.match(/^\/cart\/(\d+)$/))){let i=cart().findIndex(x=>x.cartItemId===+m[1]);if(i<0)return error('Item not found',404);if(method==='DELETE'){cart().splice(i,1);save();return resp({message:'Item deleted'})}if(method==='PUT'){let n=+data.quantity;if(!Number.isInteger(n)||n<1)return error('Enter a valid quantity');cart()[i].quantity=n;save();return resp({message:'Item updated'})}}
 if(path==='/checkout/summary'){if(!cart().length)return error('Cart is empty');return resp(checkout())}
 if(path==='/orders/place'&&method==='POST'){if(!cart().length)return error('Cart is empty');let summary=checkout();let order={order_id:db.nextId++,member_id:db.current,customer_name:current()?.username||'Demo Guest',order_date:new Date().toISOString(),total_amount:summary.final_total,status:'PACKING',item_count:summary.items.reduce((s,x)=>s+x.quantity,0),products:summary.items.map(x=>x.product_name).join(', '),items:summary.items};db.orders.push(order);db.carts[db.current||'guest']=[];save();return resp({message:'Demo order placed successfully!',order_id:order.order_id})}
 if(path==='/dashboard/data'){let arr=db.orders.slice();let q=u.searchParams;if(q.get('start_date'))arr=arr.filter(o=>o.order_date.slice(0,10)>=q.get('start_date'));if(q.get('end_date'))arr=arr.filter(o=>o.order_date.slice(0,10)<=q.get('end_date'));if(q.get('category'))arr=arr.filter(o=>o.items.some(i=>products.find(p=>p.name===i.product_name)?.category===q.get('category')));let col=q.get('sort_by')||'order_date';arr.sort((a,b)=>String(a[col]||'').localeCompare(String(b[col]||''))*(q.get('sort_order')==='ASC'?1:-1));return resp({orders:arr,user:{name:current()?.username||'Demo'}})}
 if(path==='/feedback'&&method==='GET')return resp(db.feedback.filter(f=>f.member_id===db.current).map(f=>({...f,product_name:products.find(p=>p.product_id===f.product_id)?.name||'Product'})));
 if(path==='/feedback'&&method==='POST'){
  if(!current())return error('Please log in first');let order=db.orders.find(o=>o.order_id===+data.order_id&&o.member_id===db.current);let p=products.find(p=>p.product_id===+data.product_id);if(!order||!p||!order.items.some(i=>i.product_name===p.name))return error('Please enter an order ID containing this product');let row={feedback_id:db.nextId++,member_id:db.current,username:current().username,product_id:p.product_id,order_id:order.order_id,rating:+data.rating,comment_text:data.comment_text||'',updated_at:new Date().toISOString()};db.feedback.push(row);save();return resp({message:'Feedback created successfully'})}
 if((m=path.match(/^\/feedback\/product\/(\d+)$/)))return resp({feedback:db.feedback.filter(x=>x.product_id===+m[1])});
 if((m=path.match(/^\/feedback\/(\d+)\/responses(?:\/(\d+))?$/))){let id=+m[1];if(method==='GET')return resp({responses:db.responses.filter(r=>r.feedback_id===id)});if(method==='POST'){if(!current())return error('Please log in');let row={response_id:db.nextId++,feedback_id:id,member_id:db.current,username:current().username,response_text:data.response_text,created_at:new Date().toISOString()};db.responses.push(row);save();return resp({message:'Response created'})}if(method==='DELETE'){db.responses=db.responses.filter(r=>!(r.feedback_id===id&&r.response_id===+m[2]&&r.member_id===db.current));save();return resp({message:'Response deleted'})}}
 if((m=path.match(/^\/feedback\/(\d+)$/))){let id=+m[1],i=db.feedback.findIndex(f=>f.feedback_id===id&&f.member_id===db.current);if(i<0)return error('Feedback not found',404);if(method==='DELETE'){db.feedback.splice(i,1);save();return resp({message:'Feedback deleted'})}if(method==='PUT'){Object.assign(db.feedback[i],{rating:+data.rating,comment_text:data.comment_text,updated_at:new Date().toISOString()});save();return resp({message:'Feedback updated'})}}
 return originalFetch(input,init)
};
document.addEventListener('DOMContentLoaded',()=>{
 const banner=document.createElement('div');banner.textContent='GitHub Pages DEMO — Data is stored in this browser only. Do not use real passwords.';banner.style.cssText='background:#fff3cd;color:#664d03;text-align:center;padding:8px 12px;font:14px system-ui;position:relative;z-index:9999';document.body.prepend(banner);
 document.querySelectorAll('a[href="login.html"]').forEach(a=>{if(a.textContent.trim().toLowerCase()==='logout'){a.addEventListener('click',()=>{db.current=null;save()})}});
});
})();
