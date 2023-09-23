const auto_refresh=false;
const debug_title=false;
const show_calls=false;
const box_blink=true;
const debug_remabox=false;
//
const clr={
	atr: { 
		virus: "#FF5988",
		vaccine: "#667AFF",
		data: "#FF9F29",
		free: "#808080"
	}
};
//(window.location.origin)+(window.location.pathname) might be useful

var lang=0;
var digimon_count,evo_rows,evo_columns;
var data;
var box_hover={stg: -1, id: -1, color: ""};
var box_select={stg: -1, id: -1, random: 0};
var box_status=[];
var random_list=[];
var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
var lock_clickbox=false;
var timeout=undefined; 
var timeout2=undefined; 
var preload=new Image();
var query_search = window.location.search;
const query_params = new URLSearchParams(query_search);
var ready=0;
ready=0;
preload.src="assets/art_unknown.jpg";
digimon_count=[];
//I really didn't need to make six different variables just for lines, but eh.
evo_rows=[];
evo_columns=[];
evo_rows_blue=[];
evo_columns_blue=[];
evo_rows_preview=[];
evo_columns_preview=[];

function no_css_init()
{
	var item,comp,prop;
	item=document.querySelector(".box");
	if (item!=null)
	{
		comp=window.getComputedStyle(item, null);
		prop=comp.getPropertyValue("display");
		if (prop=="flex")
		{
			item=document.querySelector(".bd-box");
			item.innerHTML='<p style="margin-left: 10px; margin-right: 10px;"><select name="lang_mode" id="lang_selector" onchange="change_lang(this)"><option value="l_en_dub">English (Dub)</option><option value="l_en_sub" selected>English (Sub)</option><option value="l_jp">日本語</option></select> | <span id="randomize-line" onclick="random_line()" onmousedown="random_down(this)" onmouseup="random_up(this)">Randomize</span></p>';
		}
	}
}

function render(lines_only)
{
	if (show_calls)
		console.log("CALL render("+lines_only+")");
	digimon_autocount();
	var draw_str="";
		
	evo_rows=[];
	evo_columns=[];
	for (var i=1; i<digimon_count.length+1; i++)
	{
		if (i>1)
		{
			evolution_row(i-1,i);
		}
	}
	for (var i=0; i<digimon_count.length; i++)
	{
		for (var d=0; d<digimon_count[i]; d++)
		{
			evolution_column("#stg"+(i+1)+"-"+(d+1),(i),(i)+2);
		}
	}

	for (var i=0; i<evo_columns.length; i++)
	{
		draw_str+='<div class="line-v" style="';
		draw_str+='height: '+(evo_columns[i].height)+"px; ";
		draw_str+='left: '+(evo_columns[i].x)+"px; ";
		draw_str+='top: '+(evo_columns[i].y)+"px;";
		draw_str+='"></div>\n'
	}
	
	for (var i=0; i<evo_rows.length; i++)
	{
		draw_str+='<div class="line-h" style="';
		draw_str+='width: '+(evo_rows[i].width)+"px; ";
		draw_str+='left: '+(evo_rows[i].x)+"px; ";
		draw_str+='top: '+(evo_rows[i].y)+"px;";
		draw_str+='"></div>\n'
	}
	
	for (var i=0; i<evo_columns_blue.length; i++)
	{
		draw_str+='<div class="evo-line-v" style="';
		draw_str+='height: '+(evo_columns_blue[i].height)+"px; ";
		draw_str+='left: '+(evo_columns_blue[i].x)+"px; ";
		draw_str+='top: '+(evo_columns_blue[i].y)+"px;";
		draw_str+='"></div>\n'
	}
	for (var i=0; i<evo_rows_blue.length; i++)
	{
		draw_str+='<div class="evo-line-h" style="';
		draw_str+='width: '+(evo_rows_blue[i].width)+"px; ";
		draw_str+='left: '+(evo_rows_blue[i].x)+"px; ";
		draw_str+='top: '+(evo_rows_blue[i].y)+"px;";
		draw_str+='"></div>\n'
	}
	
	for (var i=0; i<evo_columns_preview.length; i++)
	{
		draw_str+='<div class="prev-line-v" style="';
		draw_str+='height: '+(evo_columns_preview[i].height)+"px; ";
		draw_str+='left: '+(evo_columns_preview[i].x)+"px; ";
		draw_str+='top: '+(evo_columns_preview[i].y)+"px;";
		draw_str+='"></div>\n'
	}
	for (var i=0; i<evo_rows_preview.length; i++)
	{
		draw_str+='<div class="prev-line-h" style="';
		draw_str+='width: '+(evo_rows_preview[i].width)+"px; ";
		draw_str+='left: '+(evo_rows_preview[i].x)+"px; ";
		draw_str+='top: '+(evo_rows_preview[i].y)+"px;";
		draw_str+='"></div>\n'
	}
	document.getElementById("lines").innerHTML = draw_str;
	if (!lines_only)
		card_render()
}

function calc_dist(p0,p1)
{
	return p1-p0;
}

function display_evos(stg,digi,mode)
{
	var stg1,stg2;
	var draw_line={};
	var draw_line2={};
	var digi_top,digi_top;
	var row_left,row_right;
	var row_y,row_ydist;
	var count1,count2;
	var digi_min,digi_max;
	var my_digi,digiL,digiR;
	var allow_draw;
	if (mode==0)
	{
		box_status[stg][digi].color="red";
		box_status[stg][digi].glow=1;
	}
	//Bottom Row
	stg1=stg
	stg2=stg+1
	count1=digimon_count[stg1-1]
	count2=digimon_count[stg2-1]
	if (count2>0 && stg2<data.digimon.length)
	{
		var temp_list=[];
		digi_min=data.digimon[stg2].length;
		digi_max=0;
		for (var i=0;i<data.digimon[stg][digi].evos.length;i++)
		{
			if (mode==0)
			{
				box_status[data.digimon[stg][digi].evos[i].stg][data.digimon[stg][digi].evos[i].id].color="aqua";
				box_status[data.digimon[stg][digi].evos[i].stg][data.digimon[stg][digi].evos[i].id].glow=1;
			}
			if (data.digimon[stg][digi].evos[i].stg==stg2)
			{
				temp_list.push(data.digimon[stg][digi].evos[i].id);
			}
		}
		for (var i=0;i<temp_list.length;i++)
		{
			digi_min=Math.min(digi_min,temp_list[i]);
			digi_max=Math.max(digi_max,temp_list[i]);
			display_back(stg2,temp_list[i],mode);
		}

		if (temp_list.length>0)
		{
			display_front(stg,digi,mode);
			digi_top=digimon_box_center("#stg"+(stg1+1)+"-1");
			digi_bottom=digimon_box_center("#stg"+(stg2+1)+"-1");
			
			my_digi=digimon_box_center("#stg"+(stg+1)+"-"+(digi+1));
			digiL=digimon_box_center("#stg"+(stg2+1)+"-"+(digi_min+1));
			digiR=digimon_box_center("#stg"+(stg2+1)+"-"+(digi_max+1));

			row_left=Math.min(my_digi.x,digiL.x);
			row_right=Math.max(my_digi.x,digiR.x);
			
			row_ydist=calc_dist(digi_top.y,digi_bottom.y);
			row_y=digi_top.y+(row_ydist/2);
			
			draw_line.x=row_left;
			draw_line.y=row_y;
			draw_line.width=calc_dist(row_left,row_right);
			if (draw_line.width>0 && mode==0)
				evo_rows_blue.push(draw_line);
			if (draw_line.width>0 && mode==1)
				evo_rows_preview.push(draw_line);
			draw_line = new Object();
		}
	}
	
	//Top Row
	stg1=stg-1
	stg2=stg
	count1=digimon_count[stg1]
	count2=digimon_count[stg2-1]
	if (count1>0 && stg1>=0)
	{
		var temp_list=[];
		digi_min=data.digimon[stg1].length;
		digi_max=0;
		for (var i=0;i<data.digimon[stg][digi].pre_evos.length;i++)
		{
			if (mode==0)
			{
				box_status[data.digimon[stg][digi].pre_evos[i].stg][data.digimon[stg][digi].pre_evos[i].id].color="aqua";
				box_status[data.digimon[stg][digi].pre_evos[i].stg][data.digimon[stg][digi].pre_evos[i].id].glow=1;
			}
			if (data.digimon[stg][digi].pre_evos[i].stg==stg1)
				temp_list.push(data.digimon[stg][digi].pre_evos[i].id);
		}
		for (var i=0;i<temp_list.length;i++)
		{
			digi_min=Math.min(digi_min,temp_list[i]);
			digi_max=Math.max(digi_max,temp_list[i]);
			display_front(stg1,temp_list[i],mode);
		}		
		
		if (temp_list.length>0)
		{
			display_back(stg,digi,mode);
			digi_top=digimon_box_center("#stg"+(stg1+1)+"-1");
			digi_bottom=digimon_box_center("#stg"+(stg2+1)+"-1");
			
			my_digi=digimon_box_center("#stg"+(stg+1)+"-"+(digi+1));
			digiL=digimon_box_center("#stg"+(stg1+1)+"-"+(digi_min+1));
			digiR=digimon_box_center("#stg"+(stg1+1)+"-"+(digi_max+1));

			row_left=Math.min(my_digi.x,digiL.x);
			row_right=Math.max(my_digi.x,digiR.x);
			
			row_ydist=calc_dist(digi_top.y,digi_bottom.y);
			row_y=digi_top.y+(row_ydist/2);
			
			draw_line2.x=row_left;
			draw_line2.y=row_y;
			draw_line2.width=calc_dist(row_left,row_right);
			if (draw_line2.width>0 && mode==0)
				evo_rows_blue.push(draw_line2);
			if (draw_line2.width>0 && mode==1)
				evo_rows_preview.push(draw_line2);
		}
	}
	if (mode==0)
	render(0);	
}

function display_back(stg,digi,mode)
{
	var draw_line={};
	var draw_line2={};
	var digi_main,digi_top,digi_bottom;
	var count1,count2; 
	var colo_y,colo_ydist;
	digi_main=digimon_box_center("#stg"+(stg+1)+"-"+(digi+1));
	var stg1,stg2;
	stg1=stg
	stg2=stg+1
	count1=digimon_count[stg1-1]
	count2=digimon_count[stg2-1]
	if (count1>0)
	{
		digi_top=digimon_box_center("#stg"+stg1+"-1");
		colo_ydist=calc_dist(digi_top.y,digi_main.y);
		
		draw_line2.x=digi_main.x;
		draw_line2.y=digi_main.y-(colo_ydist/2);
		draw_line2.height=(colo_ydist/2)
		if (draw_line2.height>0 && mode==0)
			evo_columns_blue.push(draw_line2);
		if (draw_line2.height>0 && mode==1)
			evo_columns_preview.push(draw_line2);
	}
}

function display_front(stg,digi,mode)
{
	var draw_line={};
	var draw_line2={};
	var digi_main,digi_top,digi_bottom;
	var count1,count2; 
	var colo_y,colo_ydist;
	digi_main=digimon_box_center("#stg"+(stg+1)+"-"+(digi+1));
	var stg1,stg2;
	stg1=stg
	stg2=stg+1
	count1=digimon_count[stg1-1]
	count2=digimon_count[stg2-1]
	if (count2>0)
	{
		digi_bottom=digimon_box_center("#stg"+(stg2+1)+"-1");
		colo_ydist=calc_dist(digi_main.y,digi_bottom.y);
		
		draw_line2.x=digi_main.x;
		draw_line2.y=digi_main.y;
		draw_line2.height=(colo_ydist/2)
		if (draw_line2.height>0 && mode==0)
			evo_columns_blue.push(draw_line2);
		if (draw_line2.height>0 && mode==1)
			evo_columns_preview.push(draw_line2);
	}
}

function evolution_row(stg1,stg2)
{
	var draw_line={};
	var digiL_top,digiR_top;
	var digiL_bottom,digiR_bottom;
	var row_left,row_right;
	var row_y,row_ydist;
	var count1,count2; 
	count1=digimon_count[stg1-1]
	count2=digimon_count[stg2-1]
	if (count1>0 && count2>0)
	{
		digiL_top=digimon_box_center("#stg"+stg1+"-1");
		digiR_top=digimon_box_center("#stg"+stg1+"-"+count1);
		digiL_bottom=digimon_box_center("#stg"+stg2+"-1");
		digiR_bottom=digimon_box_center("#stg"+stg2+"-"+count2);
		
		row_left=Math.min(digiL_top.x,digiL_bottom.x);
		row_right=Math.max(digiR_top.x,digiR_bottom.x);
		row_ydist=calc_dist(digiL_top.y,digiL_bottom.y);
		row_y=digiL_top.y+(row_ydist/2);

		draw_line.x=row_left;
		draw_line.y=row_y;
		draw_line.width=calc_dist(row_left,row_right);
		if (draw_line.width>0)
			evo_rows.push(draw_line);
	}
}

function evolution_column(digi_str,stg1,stg2)
{
	var draw_line={};
	var draw_line2={};
	var digi_main,digi_top,digi_bottom;
	var count1,count2; 
	var colo_y,colo_ydist;
	digi_main=digimon_box_center(digi_str);
	count1=digimon_count[stg1-1]
	count2=digimon_count[stg2-1]
	if (count1>0)
	{
		digi_top=digimon_box_center("#stg"+stg1+"-1");
		colo_ydist=calc_dist(digi_top.y,digi_main.y);
		draw_line.x=digi_main.x;
		draw_line.y=digi_main.y-(colo_ydist/2);
		draw_line.height=(colo_ydist/2)
		if (draw_line.height>0)
			evo_columns.push(draw_line);
	}
	if (count2>0)
	{
		digi_bottom=digimon_box_center("#stg"+stg2+"-1");
		colo_ydist=calc_dist(digi_main.y,digi_bottom.y);
		
		draw_line2.x=digi_main.x;
		draw_line2.y=digi_main.y;
		draw_line2.height=(colo_ydist/2)
		if (draw_line2.height>0)
			evo_columns.push(draw_line2);
	}
}

function digimon_box_center(digimon_div)
{
	const offset_x=10+2;
	const offset_y=60+2;
	var digi_x,digi_y;
	digi_x=0;
	digi_y=0;
	var box=document.querySelector(".box-left-inner");
	box = box.getBoundingClientRect();

	var digi=document.querySelector(digimon_div);
	if (digi!=null)
	{
		var temp_digi = digi.getBoundingClientRect();
		var box_w=(temp_digi.right-temp_digi.left);
		var box_h=(temp_digi.bottom-temp_digi.top);
		
		digi_x=((temp_digi.left-box.left)+(box_w/2.5));
		digi_y=((temp_digi.top-box.top)+(box_h/2.5));
		digi_x+=offset_x;
		digi_y+=offset_y;
	}
	return {x: digi_x, y: digi_y};
}

function digimon_autocount()
{
	var test,test2,n;
	digimon_count=[];
	test=1;
	test2=1;
	n=0;
	s=0
	while(test!=null)
	{
		s++;
		n=0;
		test=document.querySelector("#stg"+s+"-1");
		if (test!=null)
		{
			test2=1;
			while(test2!=null)
			{
				n++;
				test2=document.querySelector("#stg"+s+"-"+n);
			}
			digimon_count.push(n-1);
		}
	}
}

function dataload_digimon()
{
	var txt="";
	var date_s="";
	var digimon_count=0;
	var lang_box;
	date=(new Date());
	date_s+=date.getFullYear().toString();
	date_s+=date.getMonth().toString();
	date_s+=date.getDate().toString();
	date_s+=date.getHours().toString();
	date_s+=date.getMinutes().toString();
	date_s+=date.getSeconds().toString();
	date_s+=date.getMilliseconds().toString();
	txt=request_data("https://loogamon.github.io/json/wind_guardians_z.json?time="+date_s);
	data=JSON.parse(txt);
	
	var raw_str="";
	var stage_str="";
	var target_mon,digi_img;
	var digimon_box;
	for (var i=0; i<data.digimon.length; i++)
	{
		raw_str+='<div class="evo-row" id="stg'+(i+1)+'">\n';
		raw_str+="</div>\n";
		box_status.push([]);
	}
	var idlist=[];
	var evolist=[];
	document.getElementById("evo-box").innerHTML = raw_str;
	for (var stg=0; stg<data.digimon.length; stg++)
	{
		stage_str=""
		for (var i=0; i<data.digimon[stg].length; i++)
		{
			var box= new Object();
			box.color="";
			box.glow=0;
			box_status[stg].push(box);
			var push={name: "", stg: "", id: ""};
			digimon_count++;
			push.name=data.digimon[stg][i].name;
			push.stg=stg;
			push.id=i;
			idlist.push(push);
			data.digimon[stg][i].pre_evos=[];
			for (var z=0;z<data.digimon[stg][i].evos.length;z++)
			{
				var evo={name: "", next: ""};
				evo.name=data.digimon[stg][i].name;
				evo.next=data.digimon[stg][i].evos[z].digimon;
				evolist.push(evo);
			}
			stage_str+='<div class="digimon-box" id="stg'+(stg+1)+'-'+(i+1)+'">'
			stage_str+="</div>"
		}
		document.getElementById("stg"+(stg+1)).innerHTML = stage_str;
	}
	
	for (var evo=0;evo<evolist.length;evo++)
	{
			for (var id=0;id<idlist.length;id++)
			{
				if (evolist[evo].name==idlist[id].name)
				{
					evolist[evo].stg=idlist[id].stg;
					evolist[evo].id=idlist[id].id;
				}
				if (evolist[evo].next==idlist[id].name)
				{
					evolist[evo].next_stg=idlist[id].stg;
					evolist[evo].next_id=idlist[id].id;
				}
			}
	}
	for (var i=0;i<evolist.length;i++)
	{
		var stg, id;
		var prev_stg,prev_id;
		var push_data={digimon: "", stg: "", id: ""};
		stg=evolist[i].next_stg;
		id=evolist[i].next_id;
		
		prev_stg=evolist[i].stg;
		prev_id=evolist[i].id;
		
		push_data.digimon=data.digimon[prev_stg][prev_id].name;
		push_data.stg=prev_stg;
		push_data.id=prev_id;
		data.digimon[stg][id].pre_evos.push(push_data);
		for (var z=0;z<data.digimon[prev_stg][prev_id].evos.length;z++)
		{
			if (data.digimon[prev_stg][prev_id].evos[z].digimon==evolist[i].next)
			{
				data.digimon[prev_stg][prev_id].evos[z].stg=stg;
				data.digimon[prev_stg][prev_id].evos[z].id=id;
			}
		}
	}
	
	for (var stg=0; stg<data.digimon.length; stg++)
	{
		stage_str=""
		for (var i=0; i<data.digimon[stg].length; i++)
		{
			target_mon="stg"+(stg+1)+'-'+(i+1);
			digi_img=data.digimon[stg][i].image.sprite;
			digimon_box=document.getElementById(target_mon)
			digimon_box.style.backgroundImage='url("digimon_art/'+digi_img+'")';
			digimon_box.title=data.digimon[stg][i].name;
			if (debug_title)
				digimon_box.title+=" ("+stg+", "+i+")"
			digimon_box.setAttribute("onclick",'box_click(this,'+(stg)+','+(i)+',0)');
			digimon_box.setAttribute("onmouseenter",'box_enter(this,'+(stg)+','+(i)+')');
			digimon_box.setAttribute("onmouseleave",'box_exit(this,'+(stg)+','+(i)+')');
			digimon_box.setAttribute("onmousedown",'box_down(this,'+(stg)+','+(i)+')');
			digimon_box.setAttribute("onmouseup",'box_enter(this,'+(stg)+','+(i)+')');
		}
	}
	console.log("Loaded "+digimon_count+" Digimon!")
	lang_box=document.querySelector("#lang_selector");
	change_lang(lang_box);
}

function box_enter(element,stg,digi)
{
	box_hover.stg=stg
	box_hover.id=digi
	box_hover.color="rgb(255,0,255)";
	//element.style.borderColor="rgb(255,0,255)";
	//element.style.boxShadow="";
	evo_columns_preview=[];
	evo_rows_preview=[];
	display_evos(stg,digi,1);
	box_update();
	render(0);
}

function box_click(element,stg,digi,sp)
{
	if (sp==0)
	{
		if (lock_clickbox==false & mobile_mode()==true)
			lock_click();
	}
	if (sp==1)
	{
		if (lock_clickbox & mobile_mode()==true)
			return;
		lock_click();
	}
	if (show_calls)
		console.log("CLICK")
	attr_exit();
	//box_hover.stg=stg
	//box_hover.id=digi
	if ((box_select.stg==stg && box_select.id==digi) || (stg==-1 && id==-1))
	{
		box_select.stg=-1
		box_select.id=-1;
		box_select.random=0;
		hide_info()
		reset_box_status();
		evo_rows_blue=[];
		evo_columns_blue=[];
		box_update();
		render(0);
		return;
	}
	box_select.stg=stg
	box_select.id=digi;
	box_select.random=0;
	show_info();
	/*console.log("---");
	console.log(data.digimon[stg][digi].name+" ("+stg+", "+digi+")");
	console.log("<Evolves From>");
	for (var i=0;i<data.digimon[stg][digi].pre_evos.length;i++)
		console.log("*",data.digimon[stg][digi].pre_evos[i].digimon,"("+data.digimon[stg][digi].pre_evos[i].stg+", "+data.digimon[stg][digi].pre_evos[i].id+")");
	console.log("<Evolves To>");
	for (var i=0;i<data.digimon[stg][digi].evos.length;i++)
		console.log("*",data.digimon[stg][digi].evos[i].digimon,"("+data.digimon[stg][digi].evos[i].stg+", "+data.digimon[stg][digi].evos[i].id+")");*/
	reset_box_status();
	evo_rows_blue=[];
	evo_columns_blue=[];
	display_evos(stg,digi,0);
	box_right=document.querySelector(".box-right");
	box_right.scrollTop = 0;
	box_update();
	rema_fix();
	blink_box();
}

function box_down(element,stg,digi)
{
	box_hover.stg=stg
	box_hover.id=digi
	box_hover.color="rgb(255,128,0)";
	//element.style.borderColor="rgb(255,128,0)";
	//element.style.boxShadow="";
	box_update();
}

function box_exit(element,stg,digi)
{
	box_hover.stg=-1
	box_hover.id=-1
	box_hover.color="";
	//element.style.borderColor="";
	//element.style.boxShadow="";
	evo_columns_preview=[];
	evo_rows_preview=[];
	box_update();
	render(0);
}

function reset_box_status()
{
	for (var stg=0;stg<box_status.length;stg++)
	{
		for (var i=0;i<box_status[stg].length;i++)
		{
			box_status[stg][i].color="";
			box_status[stg][i].glow=0;
			//box_status[stg][i].find=0;
		}
	}
}

function box_update()
{
	for (var stg=0;stg<box_status.length;stg++)
	{
		for (var i=0;i<box_status[stg].length;i++)
		{
			var target,deny_change;
			target=document.querySelector("#stg"+(stg+1)+"-"+(i+1))
			target.style.borderColor=box_status[stg][i].color;
			target.style.boxShadow="";
			//box_status[stg][i]="";
			if (box_status[stg][i].glow)
				target.style.boxShadow="0px 0px 10px 3.5px";
			if (box_status[stg][i].find)
			{
				target.style.borderColor="#ADFF2F";
				//if (!box_status[stg][i].glow)
				//	target.style.boxShadow="0px 0px 10px 3.5px blue";
			}
			if (box_hover.id==i && box_hover.stg==stg)
			{
				if (!box_hover.color=="")
					target.style.borderColor=box_hover.color;
			}
		}
	}
}

function request_data(url) {
	const xhr = new XMLHttpRequest();
	console.log("GET",url);
	xhr.open('GET', url, false);
	xhr.send(null);
	
	if (xhr.status === 200) {
		return xhr.responseText;
	} else {
		return "{digimon: [] }";
		throw new Error('Request failed: ' + xhr.statusText);
	}
}

function random_line()
{
	var dead_end=0;
	var stg=0;
	var id=0;
	var path=[];
	var digimon_list=[];
	var pick;
	var p_stg,p_id;
	var digimon = new Object();
	blink_box();
	box_select.stg=-1
	box_select.id=-1;
	box_select.random=1;
	reset_box_status();
	evo_rows_blue=[];
	evo_columns_blue=[];
	random_list=[];
	if (stg<data.digimon.length)
	{
		digimon.name=data.digimon[stg][id].name;
		digimon.p_stg=0;
		digimon.p_id=0;
		digimon.evo=-1;
		//digimon.stg=stg;
		//digimon.id=id;
		
		random_list.push(digimon);
		
		//console.log(digimon);
		box_status[stg][id].color="aqua";
		box_status[stg][id].glow=1;
	}
	while(stg<data.digimon.length)
	{
		//console.log(stg,id,data.digimon[stg][id].name);
		if (data.digimon[stg][id].evos.length>0)
		{
			digimon = new Object();
			pick=Math.floor(Math.random() * ((data.digimon[stg][id].evos.length)));
			p_stg=stg;
			p_id=id;
			
			//digimon_list.push(data.digimon[stg][id].evos[pick]);
			//console.log(data.digimon[stg][id].evos[pick]);
			
			id=data.digimon[p_stg][p_id].evos[pick].id;
			stg=data.digimon[p_stg][p_id].evos[pick].stg;
			//
			digimon.name=data.digimon[(stg)][id].name;
			digimon.p_stg=p_stg;
			digimon.p_id=p_id;
			digimon.evo=pick;
			/*digimon.name=data.digimon[(stg)][id].name;
			digimon.stg=(stg);
			digimon.id=id;
			digimon.conditions=data.digimon[p_stg][p_id].evos[pick].conditions;
			digimon.alt=data.digimon[p_stg][p_id].evos[pick].alt;
			digimon.unlock_notes=data.digimon[p_stg][p_id].evos[pick].unlock_notes;*/
			random_list.push(digimon);
			//digimon_list.push(digimon);
			evolution_direct(p_stg,p_id,stg,id);
			box_status[stg][id].color="aqua";
			box_status[stg][id].glow=1;
			//console.log(digimon);
			//
			//stg++;
		}
		else
		{
			break;
		}
	}
	box_right=document.querySelector(".box-right");
	box_right.scrollTop = 0;
	box_update();
	show_info();
	render(0);
	rema_fix();
	//console.log(random_list);
}

function evolution_direct(stg1,digi1,stg2,digi2)
{
	//console.log("Trying",stg1,digi1,stg2,digi2);
	var box1,box2;
	box1 = new Object();
	box2 = new Object();
	box1=digimon_box_center("#stg"+(stg1+1)+"-"+(digi1+1));
	box2=digimon_box_center("#stg"+(stg2+1)+"-"+(digi2+1));
	if (stg1==stg2 || Math.abs(stg1-stg2)>1)
	{
		//console.log("Nope. Not drawing a line.");
		return;
	}
	if (stg1>=(stg2+1))
	{
		var temp_stg,temp_digi;
		temp_stg=stg1;
		temp_digi=digi1;
		
		stg1=stg2;
		digi1=digi2;
		
		stg2=temp_stg;
		digi2=temp_digi;
		box1 = new Object();
		box2 = new Object();
		box1=digimon_box_center("#stg"+(stg1+1)+"-"+(digi1+1));
		box2=digimon_box_center("#stg"+(stg2+1)+"-"+(digi2+1));
		//console.log("Swapped",stg1,digi1,stg2,digi2);
	}
	if (stg1<=(stg2-1))
	{
		var nope=0;
		if (!(digi1>=0 && digi1<data.digimon[stg1].length))
			nope=1;
		if (!(digi2>=0 && digi2<data.digimon[stg2].length))
			nope=1;
		if (nope)
		{
			//console.log("That Digimon doesn't exist lol.")
			return;
		}
		//console.log(data.digimon[stg1][digi1].name,">",data.digimon[stg2][digi2].name)
		var line_l,line_r,row_ydist,row_y;
		line_l=Math.min(box1.x,box2.x);
		line_r=Math.max(box1.x,box2.x);
		
		row_ydist=calc_dist(box1.y,box2.y);
		row_y=box1.y+(row_ydist/2);
		//console.log(box1.y,box2.y);
		//console.log(line_l,line_r,calc_dist(line_l,line_r));
		//console.log(row_y);
		
		var digi_line = new Object();
		digi_line.x=line_l;
		digi_line.y=row_y;
		digi_line.width=calc_dist(line_l,line_r);
		if (digi_line.width>0)
			evo_rows_blue.push(digi_line);
		display_front(stg1,digi1,0)
		display_back(stg2,digi2,0)
	}
}

function find_attribute(atr)
{
	//reset_box_status();
	var count=0;
	for (var stg=0;stg<box_status.length;stg++)
	{
		for (var i=0;i<box_status[stg].length;i++)
		{
			box_status[stg][i].find=0;
			//console.log(stg,i,data.digimon[stg][i].attribute);
			if (data.digimon[stg][i].attribute==atr)
			{
				count++;
				box_status[stg][i].find=1;
			}
		}
	}
	box_update()
	return count;
}

function digimon_card_init()
{
	var card_box;
	var card_html="";
	card_box=document.querySelector("#digimon-profile");
	card_html+='<div class="card-box">'
	card_html+='<h2 id="dm-card-name">???</h2>'
	card_html+='<div class="dm-card-art-box"><img id="dm-card-art" class="card-box-digimon-img" src="assets/art_unknown.jpg" draggable="false" alt="???" onerror="this.src='+"'assets/art_unknown.jpg'"+'"><div id="dm-card-art-padder"></div></div>'
	card_html+='<p id="dm-card-attr-out"><span id="dm-card-attr-txt" style="font-weight: bold; color: black;">Attribute:</span> <img id="dm-card-attr-icon" src="" alt="" draggable="false" oncontextmenu="return false" onerror="this.style.display='+"'none'"+'"><span id="dm-card-attr">???</span></p>'
	//card_html+='<div class="card-box-eye">'
	card_html+='<img id="digi-eye" ontouchstart="visible_button()" ontouchend="visible_button_up()" ontouchcancel="visible_button_up()" src="assets/visible.png" oncontextmenu="return false" draggable="false" alt="Show Tree" onerror="this.style.display='+"'none'"+'">'
	//card_html+="</div>"
	card_html+="</div>"
	card_box.innerHTML=card_html;
}

function card_render()
{
	if (show_calls)
		console.log("CALL card_render()");
	var card_box,box_right,box_cover,digi_profile;
	var card_html="";
	var sel,done;
	var body;
	done=0;
	body=document.querySelector("body");
	box_right=document.querySelector(".box-right");
	box_cover=document.querySelector(".cover");
	box_cover.style.backgroundColor="rgb(0,0,0)";
	box_cover.style.backdropFilter="";
	box_cover.style.mixBlendMode="";
	//box_cover.style.opacity=0.5;
	card_box=document.querySelector("#digi-cards");
	digi_profile=document.querySelector("#digimon-profile");
	card_box.style.display="none";
	digi_profile.style.display="none";
	body.style.width="";
	body.style.height="";
	body.style.overflow="";
	if (box_select.id==-1 && box_select.stg==-1)
	{
		//console.log("So what?",box_select.id)
		card_box.style.display="none";
		box_right.style.opacity=0;
		//card_box.innerHTML=card_html;
		done=1;
		//console.log(body);
		if (box_select.random==1)
			done=0;
	}
	if (done)
		return;
	//console.log(body);
	if (mobile_mode()==true)
	{
		body.style.width="100%";
		body.style.height="100%";
		body.style.overflow="hidden";
	}
	var digi_name,digi_art,digi_attr,stg,id;
	stg=box_select.stg;
	id=box_select.id;
	if (box_select.random==0)
	{
		digi_name=data.digimon[stg][id].name;
		digi_art=data.digimon[stg][id].image.art;
		digi_attr=data.digimon[stg][id].attribute;
		
		if (lang==1 && data.digimon[stg][id].localization.eng!="")
			digi_name=data.digimon[stg][id].localization.eng;
		if (lang==2 && data.digimon[stg][id].localization.jp!="")
			digi_name=data.digimon[stg][id].localization.jp;
		
		sel=document.querySelector("#dm-card-name");
		sel.innerText=digi_name;
		
		sel=document.querySelector("#dm-card-art");
		sel.src=("digimon_art/"+digi_art);
		sel.alt=digi_name;
		
		sel=document.querySelector("#dm-card-attr");
		sel.innerText=localize_text(digi_attr);
		digi_profile.style.display="block";
		sel.style.color="";
		
		sel=document.querySelector("#dm-card-attr-icon");
		sel.style.display="none";
		switch(digi_attr)
		{
			case "Vaccine":
				sel.src="assets/ico_vaccine_clr.png";
				sel.alt=localize_text(digi_attr);
				sel.style.display="";
				sel=document.querySelector("#dm-card-attr");
				sel.style.color=clr.atr.vaccine;
			break;
			
			case "Data":
				sel.src="assets/ico_data_clr.png";
				sel.alt=localize_text(digi_attr);
				sel.style.display="";
				sel=document.querySelector("#dm-card-attr");
				sel.style.color=clr.atr.data;
			break;
			
			case "Virus":
				sel.src="assets/ico_virus_clr.png";
				sel.alt=localize_text(digi_attr);
				sel.style.display="";
				sel=document.querySelector("#dm-card-attr");
				sel.style.color=clr.atr.virus;
			break;
			
			case "Free":
				sel.src="assets/ico_free_clr.png";
				sel.alt=localize_text(digi_attr);
				sel.style.display="";
				sel=document.querySelector("#dm-card-attr");
				sel.style.color=clr.atr.free;
			break;
		}
		
		sel=document.querySelector("#dm-card-attr-txt");
		sel.innerText=(localize_text("Attribute"))+":";
		/*card_html+='<div class="card-box">\n'
		card_html+='<h2><span id="dm-card-name">'+digi_name+'</span></h2>\n'
		card_html+='<img id="dm-card-art" class="card-box-digimon-img" src="digimon_art/'+digi_art+'" alt="'+digi_name+'">\n'
		card_html+='<p><span style="font-weight: bold; color: black;">Attribute:</span> <span id="dm-card-attr">'+digi_attr+'</span></p>\n'
		card_html+="</div>\n"*/
		
		for (var i=0;i<data.digimon[stg][id].evos.length;i++)
		{
			card_html+=add_condition_box(stg,id,i);
		}
		card_box=document.querySelector("#evo-list");
		card_box.innerHTML=card_html;
		card_box=document.querySelector("#digi-cards");
		card_box.style.display="block";
		box_right.style.opacity=1;
	}
	if (box_select.random==1)
	{
		if (lang==2)
			card_html+=add_note_box("ランダム化されたルートは、リストされているすべてのデジモンのロックをすでに解除していることを前提としています。","知らせ");
		else
			card_html+=add_note_box("The randomized route assumes you had already unlocked all of the Digimon listed.","Note");
		for (var i=0;i<random_list.length;i++)
		{
			card_html+=add_condition_box(random_list[i].p_stg,random_list[i].p_id,random_list[i].evo);
		}
		//
		
		card_box=document.querySelector("#evo-list");
		card_box.innerHTML=card_html;
		card_box=document.querySelector("#digi-cards");
		card_box.style.display="block";
		box_right.style.opacity=1;
	}
	
	//console.log(card_html)
}

function render_resize()
{
	unlock_click();
	if (show_calls)
		console.log("CALL render_resize()");
	width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
	var p_digimon="";
	var digimon="";
	var d1,d2;
	reset_box_status();
	evo_rows_blue=[];
	evo_columns_blue=[];
	
	evo_rows_preview=[];
	evo_columns_preview=[];
	box_hover.stg=-1;
	box_hover.id=-1;
	box_hover.color="";
	if (box_select.stg!=-1 && box_select.id!=-1)
	{
		display_evos(box_select.stg,box_select.id,0);
	}
	if (box_select.random)
	{
		for (var i=0;i<random_list.length;i++)
		{
			digimon=random_list[i].name;
			//console.log(p_digimon,random_list[i]);
			d1=digimon_find(p_digimon)
			d2=digimon_find(digimon)
			evolution_direct(d1.stg,d1.id,d2.stg,d2.id);
			box_status[d2.stg][d2.id].color="aqua";
			box_status[d2.stg][d2.id].glow=1;
			p_digimon=random_list[i].name;
		}
	}
	box_update();
	render(0);
	rema_fix();
	var bug_cover;
	bug_cover=document.querySelector(".cover");
	if (box_select.stg==-1 && box_select.id==-1 && box_select.random==0 && mobile_mode()==1)
	{
		//This is really is an obscure bug.
		cover_click();
		//bug_cover.style.display="";	
		//bug_cover=document.querySelector("#rema-box");
		//bug_cover.style.display="";	
	}
}

function add_note_box(note,caption)
{
	var card_html="";
	card_html+='<div class="card-box" style="padding: 0px">'
	card_html+='<div class="non-unlockable-mon">'
	card_html+='<div class="dmb-splitter">'
	//
	card_html+='<div class="dmb-splitter-name" style="margin-left: 0px;">'
	card_html+='<p class="dmb-splitter-name-main">'+(caption)+'</p>'
	card_html+='</div>'
	card_html+='</div>'
	card_html+='<div class="dmb-conditions">'
	card_html+="<p>"+note+"</p>"
	card_html+='</div>'
	card_html+='</div>\n'
	card_html+='<img id="random-eye" ontouchstart="visible_button()" ontouchend="visible_button_up()" ontouchcancel="visible_button_up()" src="assets/visible.png" oncontextmenu="return false" draggable="false" alt="Show Tree"">'
	card_html+="</div>"
	return card_html;
}

function add_condition_box(stg,id,i)
{
	var card_html="";
	var digi_box_stuff="";
	var spr,t_stg,t_id;
	var temp_data;
	var digi_name="";
	spr="";
	card_html+='<div onmouseleave="attr_exit()" class="card-box" style="padding: 0px">'
	if (i==-1)
	{
		card_html+='<div class="non-unlockable-mon">'
		card_html+='<div class="dmb-splitter">'
		//
		card_html+='<div class="dmb-splitter-sprite">'
		t_stg=stg;
		t_id=id;
		var digi_maintext_stuff='onclick="subtext_click('+("'"+data.digimon[stg][id].name)+"'"+')" onmouseenter="subtext_enter(this,'+("'"+data.digimon[stg][id].name+"'")+')" onmouseleave="subtext_exit(this)"'
		digi_name=data.digimon[stg][id].name
		if (lang==1 && data.digimon[stg][id].localization.eng!="")
			digi_name=data.digimon[stg][id].localization.eng;
		if (lang==2 && data.digimon[stg][id].localization.jp!="")
			digi_name=data.digimon[stg][id].localization.jp;
		
		digi_box_stuff='onclick="box_click(this,'+(t_stg)+','+(t_id)+',1)" onmouseenter="minibox_enter(this,'+(t_stg)+','+(t_id)+')" onmouseleave="minibox_exit(this)" onmousedown="minibox_down(this)" onmouseup="minibox_enter(this)"'
		spr=data.digimon[stg][id].image.sprite;
		card_html+='<div title="'+(digi_name)+'" class="digimon-box-card" '+digi_box_stuff+' style="background-image: url('
		card_html+="'digimon_art/"+spr+"')"
		card_html+=';"'; card_html+=">"; card_html+="</div>"
		card_html+='</div>'
		//
		
		card_html+='<div class="dmb-splitter-name" style="border-bottom: 0px;">'
		card_html+='<p class="dmb-splitter-name-main" '+(digi_maintext_stuff)+'>'+digi_name+'</p>'
		card_html+='</div>'
		card_html+='</div>'
		
		/*card_html+='<div class="dmb-conditions">'
		card_html+=add_conditions(stg,id,i)
		card_html+='</div>'*/
		
		card_html+='</div>\n'
		card_html+="</div>"
		return card_html;
	}
	if (typeof data.digimon[stg][id].evos[i].alt === 'undefined' || data.digimon[stg][id].evos[i].alt === null)
	{
		var digi_maintext_stuff='onclick="subtext_click('+("'"+data.digimon[stg][id].evos[i].digimon)+"'"+')" onmouseenter="subtext_enter(this,'+("'"+data.digimon[stg][id].evos[i].digimon+"'")+')" onmouseleave="subtext_exit(this)"'
		card_html+='<div class="non-unlockable-mon">'
		card_html+='<div class="dmb-splitter">'
		//
		card_html+='<div class="dmb-splitter-sprite">'
		t_stg=data.digimon[stg][id].evos[i].stg;
		t_id=data.digimon[stg][id].evos[i].id;
		temp_data=digimon_find(data.digimon[stg][id].evos[i].digimon);
		digi_name=data.digimon[temp_data.stg][temp_data.id].name
		if (lang==1 && data.digimon[temp_data.stg][temp_data.id].localization.eng!="")
			digi_name=data.digimon[temp_data.stg][temp_data.id].localization.eng;
		if (lang==2 && data.digimon[temp_data.stg][temp_data.id].localization.jp!="")
			digi_name=data.digimon[temp_data.stg][temp_data.id].localization.jp;
		
		digi_box_stuff='onclick="box_click(this,'+(t_stg)+','+(t_id)+',1)" onmouseenter="minibox_enter(this,'+(t_stg)+','+(t_id)+')" onmouseleave="minibox_exit(this)" onmousedown="minibox_down(this)" onmouseup="minibox_enter(this)"'
		spr=data.digimon[t_stg][t_id].image.sprite;
		card_html+='<div title="'+(digi_name)+'" class="digimon-box-card" '+digi_box_stuff+' style="background-image: url('
		card_html+="'digimon_art/"+spr+"')"
		card_html+=';"'; card_html+=">"; card_html+="</div>"
		card_html+='</div>'
		//
		card_html+='<div class="dmb-splitter-name">'
		
		card_html+='<p class="dmb-splitter-name-main" '+(digi_maintext_stuff)+'>'+(digi_name)+'</p>'
		card_html+='</div>'
		card_html+='</div>'
		card_html+='<div onmouseleave="attr_exit()" class="dmb-conditions">'
		card_html+=add_conditions(stg,id,i)
		card_html+='</div>'
		card_html+='</div>\n'
	}
	else
	{
		t_stg=data.digimon[stg][id].evos[i].stg;
		t_id=data.digimon[stg][id].evos[i].id;
		temp_data=digimon_find(data.digimon[stg][id].evos[i].digimon);
		digi_name=data.digimon[temp_data.stg][temp_data.id].name
		if (lang==1 && data.digimon[temp_data.stg][temp_data.id].localization.eng!="")
			digi_name=data.digimon[temp_data.stg][temp_data.id].localization.eng;
		if (lang==2 && data.digimon[temp_data.stg][temp_data.id].localization.jp!="")
			digi_name=data.digimon[temp_data.stg][temp_data.id].localization.jp;
		var digi_maintext_stuff='onclick="subtext_click('+("'"+data.digimon[stg][id].evos[i].digimon)+"'"+')" onmouseenter="subtext_enter(this,'+("'"+data.digimon[stg][id].evos[i].digimon+"'")+')" onmouseleave="subtext_exit(this)"'
		var digi_subtext_stuff='onclick="subtext_click('+("'"+data.digimon[stg][id].evos[i].alt)+"'"+')" onmouseenter="subtext_enter(this,'+("'"+data.digimon[stg][id].evos[i].alt+"'")+')" onmouseleave="subtext_exit(this)"'
		card_html+='<div class="unlockable-mon-upper">'
		card_html+='<div class="dmb-splitter">'
		digi_box_stuff='onclick="box_click(this,'+(t_stg)+','+(t_id)+',1)" onmouseenter="minibox_enter(this,'+(t_stg)+','+(t_id)+')" onmouseleave="minibox_exit(this)" onmousedown="minibox_down(this)" onmouseup="minibox_enter(this)"'
		spr=data.digimon[t_stg][t_id].image.sprite;
		
		card_html+='<div class="dmb-splitter-sprite">'
		card_html+='<div title="'+(digi_name)+'" class="digimon-box-card" '+digi_box_stuff+' style="background-image: url('
		card_html+="'digimon_art/"+spr+"')"
		card_html+=';"'; card_html+=">"; card_html+="</div>"
		card_html+='</div>'
		
		card_html+='<div class="dmb-splitter-name">'
		card_html+='<p class="dmb-splitter-name-main" '+digi_maintext_stuff+'>'+(digi_name)+'</p>'
		temp_data=digimon_find(data.digimon[stg][id].evos[i].alt);
		digi_name=data.digimon[temp_data.stg][temp_data.id].name
		if (lang==1 && data.digimon[temp_data.stg][temp_data.id].localization.eng!="")
			digi_name=data.digimon[temp_data.stg][temp_data.id].localization.eng;
		if (lang==2 && data.digimon[temp_data.stg][temp_data.id].localization.jp!="")
			digi_name=data.digimon[temp_data.stg][temp_data.id].localization.jp;
		card_html+='<p class="dmb-splitter-name-sub" '+digi_subtext_stuff+'>'+(digi_name)+'</p>'
		card_html+='</div>'
		
		card_html+='</div>'
		
		card_html+='<div onmouseleave="attr_exit()" class="dmb-conditions">'
		card_html+=add_conditions(stg,id,i)
		card_html+='</div>'
		
		card_html+='</div>'
		card_html+='<div class="unlockable-mon">'

		if (lang==2)
			card_html+='<p>'+data.digimon[stg][id].evos[i].unlock_notes_jp+'</p>'
		else
			card_html+='<p>'+data.digimon[stg][id].evos[i].unlock_notes+'</p>'
		card_html+='</div>\n'
	}
	card_html+="</div>"
	return card_html;
}

function add_conditions(stg,id,i)
{
	var cond_str="";
	var attribute_jogress=0;
	var jogress_note=localize_text("jogress_samelevel");
	if (i<0)
	{
		cond_str+="<p><em>"+localize_text("lvl_baseform")+"</em></p>"
		return cond_str;
	}
	if (typeof data.digimon[stg][id].evos[i].conditions === 'undefined' || data.digimon[stg][id].evos[i].conditions === null)
	{
		cond_str+="<p><em>"+localize_text("evo_noreq")+"</em></p>"
		return cond_str;
	}
	if (!(typeof data.digimon[stg][id].evos[i].conditions.care_mistakes === 'undefined' || data.digimon[stg][id].evos[i].conditions.care_mistakes === null))
	{
		//console.log(stg,id,i,"Care Mistakes!")
		cond_str+="<p><span class='condition-caremistakes'>"+localize_text("Care Mistakes")+":</span> "+(data.digimon[stg][id].evos[i].conditions.care_mistakes)+"</p>"
	}
	if (!(typeof data.digimon[stg][id].evos[i].conditions.effort === 'undefined' || data.digimon[stg][id].evos[i].conditions.effort === null))
	{
		//console.log(stg,id,i,"Effort!")
		cond_str+="<p><span class='condition-effortlvl'>"+localize_text("Effort")+":</span> "+(data.digimon[stg][id].evos[i].conditions.effort)+"</p>"
	}
	if (!(typeof data.digimon[stg][id].evos[i].conditions.level === 'undefined' || data.digimon[stg][id].evos[i].conditions.level === null))
	{
		//console.log(stg,id,i,"Level!")
		cond_str+="<p><span class='condition-effortlvl'>"+localize_text("Level")+":</span> "+(data.digimon[stg][id].evos[i].conditions.level)+"</p>"
	}
	if (!(typeof data.digimon[stg][id].evos[i].conditions.battle_wins === 'undefined' || data.digimon[stg][id].evos[i].conditions.battle_wins === null))
	{
		//console.log(stg,id,i,"Battle Wins!")
		cond_str+="<p><span class='condition-jogressbattle'>"+localize_text("Battle Wins")+":</span> "+(data.digimon[stg][id].evos[i].conditions.battle_wins)+"</p>"
	}
	if (!(typeof data.digimon[stg][id].evos[i].conditions.jogress === 'undefined' || data.digimon[stg][id].evos[i].conditions.jogress === null))
	{
		//console.log(stg,id,i,"Jogress!")
		var jogress_str=(data.digimon[stg][id].evos[i].conditions.jogress);
		if (jogress_str.search("Vaccine")!=-1 || jogress_str.search("Virus")!=-1 || jogress_str.search("Data")!=-1 || jogress_str.search("Free")!=-1)
			attribute_jogress=1;
		if (!attribute_jogress)
		{
			jogress_str="<img class='dmb-conditions-digimon-icon' src='digimon_art/"+external_digimon_sprite(data.digimon[stg][id].evos[i].conditions.jogress)+"' alt='"+(localize_external_digimon(data.digimon[stg][id].evos[i].conditions.jogress))+"' draggable='false' oncontextmenu='return false' onerror='this.style.display="+'"none"'+"'>"+localize_external_digimon(data.digimon[stg][id].evos[i].conditions.jogress);
		}
		//console.log(data.digimon[stg][id].evos[i].conditions.jogress,attribute_jogress);
		jogress_str=jogress_str.replace("Vaccine","<img class='dmb-conditions-attr-icon' src='assets/ico_vaccine_clr.png' alt='"+localize_text("Vaccine")+"' draggable='false' oncontextmenu='return false' onerror='this.style.display="+'"none"'+"'>"+"<span style='"+'color: '+(clr.atr.vaccine)+';'+"' onmouseenter='attr_enter("+'"Vaccine"'+")' class='dmb-conditions-attr'>"+localize_text("Vaccine")+"</span>");
		jogress_str=jogress_str.replace("Virus","<img class='dmb-conditions-attr-icon' src='assets/ico_virus_clr.png' alt='"+localize_text("Virus")+"' draggable='false' oncontextmenu='return false' onerror='this.style.display="+'"none"'+"'>"+"<span style='"+'color: '+(clr.atr.virus)+';'+"' onmouseenter='attr_enter("+'"Virus"'+")' class='dmb-conditions-attr'>"+localize_text("Virus")+"</span>");
		jogress_str=jogress_str.replace("Data","<img class='dmb-conditions-attr-icon' src='assets/ico_data_clr.png' alt='"+localize_text("Data")+"' draggable='false' oncontextmenu='return false' onerror='this.style.display="+'"none"'+"'>"+"<span style='"+'color: '+(clr.atr.data)+';'+"' onmouseenter='attr_enter("+'"Data"'+")' class='dmb-conditions-attr'>"+localize_text("Data")+"</span>");
		jogress_str=jogress_str.replace("Free","<img class='dmb-conditions-attr-icon' src='assets/ico_free_clr.png' alt='"+localize_text("Free")+"' draggable='false' oncontextmenu='return false' onerror='this.style.display="+'"none"'+"'>"+"<span style='"+'color: '+(clr.atr.free)+';'+"' onmouseenter='attr_enter("+'"Free"'+")' class='dmb-conditions-attr'>"+localize_text("Free")+"</span>");
		if (attribute_jogress && data.device.jogress_anylevel==false)
		{
			//jogress_str+=" <span class='help-text' title='"+(jogress_note)+"'>(?)</span>"
			jogress_str+="<br><sub><em>"+(jogress_note)+"</em></sub>"
		}
		cond_str+="<p onmouseleave='attr_exit()'><span class='condition-jogressbattle'>"+localize_text("Jogress")+":</span> "+(jogress_str)+"</p>"
	}
	return cond_str;
}

function minibox_enter(element,stg,id)
{
	element.style.borderColor="rgb(255,0,255)";
	
	box_hover.stg=stg
	box_hover.id=id
	box_hover.color="rgb(255,0,255)";
	evo_columns_preview=[];
	evo_rows_preview=[];
	display_evos(stg,id,1);
	box_update();
	render(1);
}

function minibox_exit(element)
{
	element.style.borderColor="";
	box_hover.stg=-1
	box_hover.id=-1
	box_hover.color="";
	evo_columns_preview=[];
	evo_rows_preview=[];
	box_update();
	render(1);
}

function minibox_down(element)
{
	element.style.borderColor="rgb(255,128,0)";
}

function subtext_enter(element,digimon)
{
	var locate=digimon_find(digimon);
	element.style.textDecoration="underline";
	
	box_hover.stg=locate.stg
	box_hover.id=locate.id
	box_hover.color="rgb(255,0,255)";
	evo_columns_preview=[];
	evo_rows_preview=[];
	display_evos(locate.stg,locate.id,1);
	box_update();
	render(1);
	//console.log(locate);
}

function subtext_exit(element)
{
	element.style.textDecoration="";
	box_hover.stg=-1
	box_hover.id=-1
	box_hover.color="";
	evo_columns_preview=[];
	evo_rows_preview=[];
	box_update();
	render(1);
}

function subtext_click(digimon)
{
	var locate=digimon_find(digimon);
	//console.log(locate);
	box_click(0,locate.stg,locate.id);
}

function attr_enter(atr)
{
	find_attribute(atr);
	//element.style.textDecoration="underline";
}

function attr_exit() //Seriously, why does Google Chrome not work???
{
	find_attribute("");
}

function digimon_find(digi_name)
{
	var find={stg: -1, id: -1};
	for (var x=0;x<data.digimon.length;x++)
	{
		for (var y=0;y<data.digimon[x].length;y++)
		{
			if (data.digimon[x][y].name==digi_name)
			{
				find.stg=x;
				find.id=y;
				return find;
			}
		}
	}
	return find;
}

function external_digimon_find(digi_name)
{
	var find=-1;
	for (var x=0;x<data.external_digimon.length;x++)
	{
		if (data.external_digimon[x].name==digi_name)
		{
			find=x;
			return find;
		}
	}
	return find;
}

function random_down(element)
{
	element.style.color="red";
}

function random_up(element)
{
	element.style.color="";
}

function change_lang(element)
{
	if (element==null)
		return;
	var random_span;
	switch(element.value)
	{
		case "l_en_sub":
			lang=0;
			break;
		
		case "l_en_dub":
			lang=1;
			break;
		
		case "l_jp":
			lang=2;
			break;
	}
	random_span=document.getElementById("randomize-line");
	random_span.innerText="Randomize";
	if (lang==2)
		random_span.innerText="ランダム化する";
	rename_digimon_boxes();
	render(0);
}

function rename_digimon_boxes()
{
	var digimon_box,target_mon;
	for (var stg=0; stg<data.digimon.length; stg++)
	{
		for (var id=0; id<data.digimon[stg].length; id++)
		{
			target_mon=("stg"+(stg+1)+"-"+(id+1));
			digimon_box=document.getElementById(target_mon);
			digimon_box.title=data.digimon[stg][id].name;
			if (lang==1 && data.digimon[stg][id].localization.eng!="")
				digimon_box.title=data.digimon[stg][id].localization.eng;
			if (lang==2 && data.digimon[stg][id].localization.jp!="")
				digimon_box.title=data.digimon[stg][id].localization.jp;
			if (debug_title)
				digimon_box.title+=" ("+(stg)+", "+(id)+")"
		}
	}
}

function localize_external_digimon(digi_name)
{
	var digi_str;
	var ex_find;
	digi_str=digi_name;
	ex_find=external_digimon_find(digi_str);
	if (ex_find!=-1)
	{
		if (lang==1 && data.external_digimon[ex_find].localization.eng!="")
			digi_name=data.external_digimon[ex_find].localization.eng;
		if (lang==2 && data.external_digimon[ex_find].localization.jp!="")
			digi_name=data.external_digimon[ex_find].localization.jp;
	}
	return digi_name;
}

function external_digimon_sprite(digi_name)
{
	var digi_str,digi_img;
	var ex_find;
	digi_img="";
	ex_find=external_digimon_find(digi_name);
	if (ex_find!=-1)
	{
		if (data.external_digimon[ex_find].image.sprite!="")
			digi_img=data.external_digimon[ex_find].image.sprite;
	}
	return digi_img;
}


function localize_text(str_text)
{
	var res;
	res=str_text;
	switch(str_text)
	{
		case "Jogress": if (lang==1) res="DNA Digivolve"; if (lang==2) res="ジょグレス"; break;
		
		case "Attribute": if (lang==2) res="属性"; break;
		case "Level": if (lang==2) res="レベル"; break;
		
		case "Virus": if (lang==2) res="ウィルス"; break;
		case "Data": if (lang==2) res="データ"; break;
		case "Vaccine": if (lang==2) res="ワクチン"; break;
		case "Free": if (lang==2) res="フリー"; break;
		
		case "Baby-I": if (lang==1) res="Fresh"; if (lang==2) res="幼年期Ⅰ"; break;
		case "Baby-II": if (lang==1) res="In-Training"; if (lang==2) res="幼年期Ⅱ"; break;
		case "Child": if (lang==1) res="Rookie"; if (lang==2) res="成長期"; break;
		case "Adult": if (lang==1) res="Champion"; if (lang==2) res="成熟期"; break;
		case "Perfect": if (lang==1) res="Ultimate"; if (lang==2) res="完全体"; break;
		case "Ultimate": if (lang==1) res="Mega"; if (lang==2) res="究極体"; break;
		case "Super Ultimate": if (lang==1) res="Ultra"; if (lang==2) res="超究極体"; break;
		
		case "Care Mistakes": if (lang==2) res="世話誤脱"; break;
		case "Effort": if (lang==2) res="努力"; break;
		case "Battle Wins": if (lang==2) res="連戦"; break;
		
		case "jogress_samelevel": 
			res="(The Digimon must be at the same level.)";
			if (lang==2) res="（デジモンも同じレベルでなければなりません。）";
		break;
		
		case "lvl_baseform": 
			res="(Base Form)";
			if (lang==2) res="（元本形）";
		break;
		
		case "evo_noreq": 
			res="(No Requirements)";
			if (lang==2) res="（要件なし）";
		break;
	}
	return res;
}

function mobile_mode()
{
	var item,comp,prop;
	item=document.querySelector(".imdummy");
	if (item!=null)
	{
		comp=window.getComputedStyle(item, null);
		prop="";
		prop=comp.getPropertyValue("opacity");
		if (prop==1)
		{
			return true;
		}
	}
	return false;
}

function rescale_boxes()
{
	/*var item,comp,prop;
	var p_width,p_height;
	var boxes;
	boxes=document.querySelectorAll("div.digimon-box");
	for (var i=0;i<boxes.length;i++)
	{
		boxes[i].style.width="";
	}
	//console.log("Hi");
	item=document.querySelector(".imdummy");
	if (item!=null)
	{
		//console.log("Punch");
		//console.log(item.style);
		comp=window.getComputedStyle(item, null);
		//console.log(comp);
		prop="";
		prop=comp.getPropertyValue("opacity");
		//console.log(prop)
		if (prop==1)
		{
			console.log("HACKY AS FUCK, BUT...!");
			boxes=document.querySelectorAll("div.digimon-box");
			//console.log(boxes);
			for (var i=0;i<boxes.length;i++)
			{
				console.log(width);
				boxes[i].style.width=(60-(width/1.5))+"px";
			}
		}
	}*/
}

function show_info()
{
	box_right=document.querySelector(".box-right");
	box_right.style.display="flex";
	box_right=document.querySelector(".cover");
	box_right.style.display="block";
	box_right=document.querySelector("#rema-box");
	box_right.style.display="block";
}

function hide_info()
{
	//console.log("Calls on Hide!");
	box_right=document.querySelector("#rema-box");
	box_right.style.display="";	
}

function cover_click()
{
	if (lock_clickbox & mobile_mode()==true)
		return;
	lock_click();
	
	if (mobile_mode()==false)
		return;
	box_right=document.querySelector(".box-right");
	box_right.style.display="";
	box_right=document.querySelector(".cover");
	box_right.style.display="";	
	box_right=document.querySelector("#rema-box");
	box_right.style.display="";	
	
	box_select.stg=-1
	box_select.id=-1;
	box_select.random=0;
	hide_info()
	reset_box_status();
	evo_rows_blue=[];
	evo_columns_blue=[];
	box_update();
	render(0);
}

function bottom_click()
{
	if (mobile_mode()==true)
		cover_click();
}

function rema_fix()
{
	var rema_box,rema_loc,box_right;
	var b_box,b_loc,b_right;
	var h;
	//console.log("REMAMON!!!");
	rema_box=document.querySelector("#rema-box");
	rema_loc=document.querySelector("#evo-list");
	box_right=document.querySelector(".box-right");
	
	if ((rema_box!=null) && (rema_loc!=null) && (box_right!=null))
	{
		rema_box.style.opacity=0;
		if (debug_remabox)
			rema_box.style.opacity=0.5;
		if (box_right.scrollTop==0)
		{
			//console.log("REA");
			b_box=rema_box.getBoundingClientRect();
			b_loc=rema_loc.getBoundingClientRect();
			b_right=box_right.getBoundingClientRect();
			//console.log(b_loc.top,b_loc.left);
			//console.log(rema_box.style);
			rema_box.style.top=((b_loc.bottom)+(window.scrollY))+"px";
			rema_box.style.left=(0)+"px";
			if (mobile_mode()==1)
				rema_box.style.left+="50%";
			rema_box.style.width=calc_dist(b_right.left,b_right.right+24)+"px";
			rema_box.style.height="0px";
			h=(calc_dist((b_loc.bottom),(b_right.bottom-8)+box_right.scrollTop));
			rema_box.style.height="0px";
			//console.log(box_right.scrollTop);
			if (h>0)
				rema_box.style.height=h+"px";
			if (mobile_mode()==0)
				rema_box.style.width="0px";
		}
		else
		{
			rema_box.style.width="0px";
			rema_box.style.height="0px";
			rema_box.style.top="0px";
			rema_box.style.left="0px";
		}
	}
}

function try_scroll()
{
	rema_fix();
}

function visible_button()
{
	var box_right,box_cover;
	var opa;
	const DIVI=3;
	if (mobile_mode()==true)
	{
		//alert("LMAO");
		box_right=document.querySelector(".box-right");
		box_cover=document.querySelector(".cover");
		opa=box_right.style.opacity;
		opa=1;
		if (opa==1)
		{
			opa=0.05;
			box_cover.style.backgroundColor="rgb(63,63,)";
			box_cover.style.backdropFilter="blur(0px)";
			box_cover.style.mixBlendMode="overlay";
			//box_cover.style.opacity=0.5/DIVI;
		}
		else
		{
			opa=1;
			box_cover.style.backgroundColor="rgb(0,0,0)";
			box_cover.style.backdropFilter="";
			box_cover.style.mixBlendMode="";
			//box_cover.style.opacity=0.5;
		}
		box_right.style.opacity=opa;
	}
}

function visible_button_up()
{
	var box_right,box_cover;
	var box_right,box_cover;
	var opa;
	if (mobile_mode()==true)
	{
		//alert("LMAO");
		box_right=document.querySelector(".box-right");
		box_cover=document.querySelector(".cover");
		opa=box_right.style.opacity;
		opa=1;
		box_cover.style.backgroundColor="rgb(0,0,0)";
		box_cover.style.backdropFilter="";
		box_cover.style.mixBlendMode="";
		//box_cover.style.opacity=0.5/DIVI;
		box_right.style.opacity=opa;
	}
}

function lock_click()
{
	lock_clickbox=true;
	timeout=setTimeout(unlock_click, 350);
}

function unlock_click()
{
	lock_clickbox=false;
	clearTimeout(timeout);
}

function blink_box()
{
	var item;
	if (!box_blink)
		return;
	item=document.querySelector("#digi-cards");
	item.style.opacity=0;
	item=document.querySelector(".box-right");
	item.style.overflow="hidden";
	//item.style.opacity=0;
	//item=document.querySelectorAll(".box-right::-webkit-scrollbar-thumb:hover");
	
	//lock_clickbox=true;
	timeout2=setTimeout(unblink_box, 90);
}

function unblink_box()
{
	var item;
	item=document.querySelector("#digi-cards");
	item.style.opacity=1;
	item=document.querySelector(".box-right");
	item.style.overflow="";
	//lock_clickbox=false;
	clearTimeout(timeout2);
}

function preload_digimon()
{
	var digi_name,digi_lang,lb;
	var digi;
	digi_name=query_params.get('digimon')
	if (digi_name!=null)
	{
		//console.log("There's something. Cool. Is it "+digi_name+"?");
		digi=digimon_find(digi_name);
		//console.log(digi);
		if (digi.stg!=-1 && digi.id!=-1)
		{
			//box_select.stg=digi.stg;
			//box_select.id=digi.id;
			
			box_click(null,digi.stg,digi.id,1);
		}
	}
	digi_lang=query_params.get('l')
	lb=document.querySelector("#lang_selector");
	//console.log(digi_lang);
	if (lb!=null)
	{
		switch (digi_lang)
		{
			case "en_dub": lb.value="l_en_dub"; break;
			case "en_sub": lb.value="l_en_sub"; break;
			case "jp": lb.value="l_jp"; break;
		}
		change_lang(lb);
	}
	ready=1;
}

function img_reload()
{
	alert("HEY LUIGI");
}