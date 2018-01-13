/**
 * Resize function without multiple trigger
 * 
 * Usage:
 * $(window).smartresize(function(){  
 *     // code here
 * });
 */
(function ($, sr) {
	var debounce = function (func, threshold, execAsap) {
		var timeout;

		return function debounced() {
			var obj = this, args = arguments;
			function delayed() {
				if (!execAsap)
					func.apply(obj, args);
				timeout = null;
			}

			if (timeout)
				clearTimeout(timeout);
			else if (execAsap)
				func.apply(obj, args);

			timeout = setTimeout(delayed, threshold || 100);
		};
	};

	// smartresize 
	jQuery.fn[sr] = function (fn) { return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };

})(jQuery, 'smartresize');

var CURRENT_URL = window.location.href.split('#')[0].split('?')[0],
	$BODY = $('body'),
	$MENU_TOGGLE = $('#menu_toggle'),
	$SIDEBAR_MENU = $('#sidebar-menu'),
	$SIDEBAR_FOOTER = $('.sidebar-footer'),
	$LEFT_COL = $('.left_col'),
	$RIGHT_COL = $('.right_col'),
	$NAV_MENU = $('.nav_menu'),
	$FOOTER = $('footer');

var url = "http://localhost:8888/aedb/scripts/";
var barGraph = null, barGraph1;
var lineGraph;
var idCliente;
var lastData;
var porLer;
var lidos;


// Sidebar
function init_sidebar() {
	var setContentHeight = function () {
		// reset height
		$RIGHT_COL.css('min-height', $(window).height());

		var bodyHeight = $BODY.outerHeight(),
			footerHeight = $BODY.hasClass('footer_fixed') ? -10 : $FOOTER.height(),
			leftColHeight = $LEFT_COL.eq(1).height() + $SIDEBAR_FOOTER.height(),
			contentHeight = bodyHeight < leftColHeight ? leftColHeight : bodyHeight;

		// normalize content
		contentHeight -= $NAV_MENU.height() + footerHeight;

		$RIGHT_COL.css('min-height', contentHeight);
	};

	$SIDEBAR_MENU.find('a').on('click', function (ev) {
		console.log('clicked - sidebar_menu');
		var $li = $(this).parent();

		if ($li.is('.active')) {
			$li.removeClass('active active-sm');
			$('ul:first', $li).slideUp(function () {
				setContentHeight();
			});
		} else {
			// prevent closing menu if we are on child menu
			if (!$li.parent().is('.child_menu')) {
				$SIDEBAR_MENU.find('li').removeClass('active active-sm');
				$SIDEBAR_MENU.find('li ul').slideUp();
			} else {
				if ($BODY.is(".nav-sm")) {
					$SIDEBAR_MENU.find("li").removeClass("active active-sm");
					$SIDEBAR_MENU.find("li ul").slideUp();
				}
			}
			$li.addClass('active');

			$('ul:first', $li).slideDown(function () {
				setContentHeight();
			});
		}
	});

	// toggle small or large menu 
	$MENU_TOGGLE.on('click', function () {
		console.log('clicked - menu toggle');

		if ($BODY.hasClass('nav-md')) {
			$SIDEBAR_MENU.find('li.active ul').hide();
			$SIDEBAR_MENU.find('li.active').addClass('active-sm').removeClass('active');
		} else {
			$SIDEBAR_MENU.find('li.active-sm ul').show();
			$SIDEBAR_MENU.find('li.active-sm').addClass('active').removeClass('active-sm');
		}

		$BODY.toggleClass('nav-md nav-sm');

		setContentHeight();
	});

	// check active menu
	$SIDEBAR_MENU.find('a[href="' + CURRENT_URL + '"]').parent('li').addClass('current-page');

	$SIDEBAR_MENU.find('a').filter(function () {
		return this.href == CURRENT_URL;
	}).parent('li').addClass('current-page').parents('ul').slideDown(function () {
		setContentHeight();
	}).parent().addClass('active');

	// recompute content when resizing
	$(window).smartresize(function () {
		setContentHeight();
	});

	setContentHeight();

	// fixed sidebar
	if ($.fn.mCustomScrollbar) {
		$('.menu_fixed').mCustomScrollbar({
			autoHideScrollbar: true,
			theme: 'minimal',
			mouseWheel: { preventDefault: true }
		});
	}
};
// /Sidebar

var randNum = function () {
	return (Math.floor(Math.random() * (1 + 40 - 20))) + 20;
};


// Panel toolbox
$(document).ready(function () {
	$('.collapse-link').on('click', function () {
		var $BOX_PANEL = $(this).closest('.x_panel'),
			$ICON = $(this).find('i'),
			$BOX_CONTENT = $BOX_PANEL.find('.x_content');

		if ($BOX_PANEL.attr('style')) {
			$BOX_CONTENT.slideToggle(200, function () {
				$BOX_PANEL.removeAttr('style');
			});
		} else {
			$BOX_CONTENT.slideToggle(200);
			$BOX_PANEL.css('height', 'auto');
		}

		$ICON.toggleClass('fa-chevron-up fa-chevron-down');
	});

	$('.close-link').click(function () {
		var $BOX_PANEL = $(this).closest('.x_panel');

		$BOX_PANEL.remove();
	});
});
// /Panel toolbox

// Tooltip
$(document).ready(function () {
	$('[data-toggle="tooltip"]').tooltip({
		container: 'body'
	});
});
// /Tooltip

// Progressbar
if ($(".progress .progress-bar")[0]) {
	$('.progress .progress-bar').progressbar();
}
// /Progressbar

// Switchery
$(document).ready(function () {
	if ($(".js-switch")[0]) {
		var elems = Array.prototype.slice.call(document.querySelectorAll('.js-switch'));
		elems.forEach(function (html) {
			var switchery = new Switchery(html, {
				color: '#26B99A'
			});
		});
	}
});
// /Switchery


// iCheck
$(document).ready(function () {
	if ($("input.flat")[0]) {
		$(document).ready(function () {
			$('input.flat').iCheck({
				checkboxClass: 'icheckbox_flat-green',
				radioClass: 'iradio_flat-green'
			});
		});
	}
});
// /iCheck

// Table
$('table input').on('ifChecked', function () {
	checkState = '';
	$(this).parent().parent().parent().addClass('selected');
	countChecked();
});
$('table input').on('ifUnchecked', function () {
	checkState = '';
	$(this).parent().parent().parent().removeClass('selected');
	countChecked();
});

var checkState = '';

$('.bulk_action input').on('ifChecked', function () {
	checkState = '';
	$(this).parent().parent().parent().addClass('selected');
	countChecked();
});
$('.bulk_action input').on('ifUnchecked', function () {
	checkState = '';
	$(this).parent().parent().parent().removeClass('selected');
	countChecked();
});
$('.bulk_action input#check-all').on('ifChecked', function () {
	checkState = 'all';
	countChecked();
});
$('.bulk_action input#check-all').on('ifUnchecked', function () {
	checkState = 'none';
	countChecked();
});

function countChecked() {
	if (checkState === 'all') {
		$(".bulk_action input[name='table_records']").iCheck('check');
	}
	if (checkState === 'none') {
		$(".bulk_action input[name='table_records']").iCheck('uncheck');
	}

	var checkCount = $(".bulk_action input[name='table_records']:checked").length;

	if (checkCount) {
		$('.column-title').hide();
		$('.bulk-actions').show();
		$('.action-cnt').html(checkCount + ' Records Selected');
	} else {
		$('.column-title').show();
		$('.bulk-actions').hide();
	}
}



// Accordion
$(document).ready(function () {
	$(".expand").on("click", function () {
		$(this).next().slideToggle(200);
		$expand = $(this).find(">:first-child");

		if ($expand.text() == "+") {
			$expand.text("-");
		} else {
			$expand.text("+");
		}
	});
});

// NProgress
if (typeof NProgress != 'undefined') {
	$(document).ready(function () {
		NProgress.start();
	});

	$(window).load(function () {
		NProgress.done();
	});
}


//hover and retain popover when on popover content
var originalLeave = $.fn.popover.Constructor.prototype.leave;
$.fn.popover.Constructor.prototype.leave = function (obj) {
	var self = obj instanceof this.constructor ?
		obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type);
	var container, timeout;

	originalLeave.call(this, obj);

	if (obj.currentTarget) {
		container = $(obj.currentTarget).siblings('.popover');
		timeout = self.timeout;
		container.one('mouseenter', function () {
			clearTimeout(timeout);
			container.one('mouseleave', function () {
				$.fn.popover.Constructor.prototype.leave.call(self, self);
			});
		});
	}
};

$('body').popover({
	selector: '[data-popover]',
	trigger: 'click hover',
	delay: {
		show: 50,
		hide: 400
	}
});


function gd(year, month, day) {
	return new Date(year, month - 1, day).getTime();
}


/* AUTOSIZE */

function init_autosize() {

	if (typeof $.fn.autosize !== 'undefined') {

		autosize($('.resizable_textarea'));

	}

};

/* PARSLEY */

function init_parsley() {

	if (typeof (parsley) === 'undefined') { return; }
	console.log('init_parsley');

	$/*.listen*/('parsley:field:validate', function () {
		validateFront();
	});
	$('#demo-form .btn').on('click', function () {
		$('#demo-form').parsley().validate();
		validateFront();
	});
	var validateFront = function () {
		if (true === $('#demo-form').parsley().isValid()) {
			$('.bs-callout-info').removeClass('hidden');
			$('.bs-callout-warning').addClass('hidden');
		} else {
			$('.bs-callout-info').addClass('hidden');
			$('.bs-callout-warning').removeClass('hidden');
		}
	};

	$/*.listen*/('parsley:field:validate', function () {
		validateFront();
	});
	$('#demo-form2 .btn').on('click', function () {
		$('#demo-form2').parsley().validate();
		validateFront();
	});
	var validateFront = function () {
		if (true === $('#demo-form2').parsley().isValid()) {
			$('.bs-callout-info').removeClass('hidden');
			$('.bs-callout-warning').addClass('hidden');
		} else {
			$('.bs-callout-info').addClass('hidden');
			$('.bs-callout-warning').removeClass('hidden');
		}
	};

	try {
		hljs.initHighlightingOnLoad();
	} catch (err) { }

};


/* INPUTS */

function onAddTag(tag) {
	alert("Added a tag: " + tag);
}

function onRemoveTag(tag) {
	alert("Removed a tag: " + tag);
}

function onChangeTag(input, tag) {
	alert("Changed a tag: " + tag);
}

//tags input
function init_TagsInput() {

	if (typeof $.fn.tagsInput !== 'undefined') {

		$('#tags_1').tagsInput({
			width: 'auto'
		});

	}

};






/* INPUT MASK */

function init_InputMask() {

	if (typeof ($.fn.inputmask) === 'undefined') { return; }
	console.log('init_InputMask');

	$(":input").inputmask();

};







/* SMART WIZARD */

function init_SmartWizard() {

	if (typeof ($.fn.smartWizard) === 'undefined') { return; }
	console.log('init_SmartWizard');

	$('#wizard').smartWizard();

	$('#wizard_verticle').smartWizard({
		transitionEffect: 'slide'
	});

	$('.buttonNext').addClass('btn btn-success');
	$('.buttonPrevious').addClass('btn btn-primary');
	$('.buttonFinish').addClass('btn btn-default');

};


/* PNotify */

function init_PNotify() {

	if (typeof (PNotify) === 'undefined') { return; }
	console.log('init_PNotify');

	new PNotify({
		title: "PNotify",
		type: "info",
		text: "Welcome. Try hovering over me. You can click things behind me, because I'm non-blocking.",
		nonblock: {
			nonblock: true
		},
		addclass: 'dark',
		styling: 'bootstrap3',
		hide: false,
		before_close: function (PNotify) {
			PNotify.update({
				title: PNotify.options.title + " - Enjoy your Stay",
				before_close: null
			});

			PNotify.queueRemove();

			return false;
		}
	});

};


/* CUSTOM NOTIFICATION */

function init_CustomNotification() {

	console.log('run_customtabs');

	if (typeof (CustomTabs) === 'undefined') { return; }
	console.log('init_CustomTabs');

	var cnt = 10;

	TabbedNotification = function (options) {
		var message = "<div id='ntf" + cnt + "' class='text alert-" + options.type + "' style='display:none'><h2><i class='fa fa-bell'></i> " + options.title +
			"</h2><div class='close'><a href='javascript:;' class='notification_close'><i class='fa fa-close'></i></a></div><p>" + options.text + "</p></div>";

		if (!document.getElementById('custom_notifications')) {
			alert('doesnt exists');
		} else {
			$('#custom_notifications ul.notifications').append("<li><a id='ntlink" + cnt + "' class='alert-" + options.type + "' href='#ntf" + cnt + "'><i class='fa fa-bell animated shake'></i></a></li>");
			$('#custom_notifications #notif-group').append(message);
			cnt++;
			CustomTabs(options);
		}
	};

	CustomTabs = function (options) {
		$('.tabbed_notifications > div').hide();
		$('.tabbed_notifications > div:first-of-type').show();
		$('#custom_notifications').removeClass('dsp_none');
		$('.notifications a').click(function (e) {
			e.preventDefault();
			var $this = $(this),
				tabbed_notifications = '#' + $this.parents('.notifications').data('tabbed_notifications'),
				others = $this.closest('li').siblings().children('a'),
				target = $this.attr('href');
			others.removeClass('active');
			$this.addClass('active');
			$(tabbed_notifications).children('div').hide();
			$(target).show();
		});
	};

	CustomTabs();

	var tabid = idname = '';

	$(document).on('click', '.notification_close', function (e) {
		idname = $(this).parent().parent().attr("id");
		tabid = idname.substr(-2);
		$('#ntf' + tabid).remove();
		$('#ntlink' + tabid).parent().remove();
		$('.notifications a').first().addClass('active');
		$('#notif-group div').first().css('display', 'block');
	});

};



/* DATA TABLES */

function init_DataTables() {

	console.log('run_datatables');

	if (typeof ($.fn.DataTable) === 'undefined') { return; }
	console.log('init_DataTables');

	var handleDataTableButtons = function () {
		if ($("#datatable-buttons").length) {
			$("#datatable-buttons").DataTable({
				dom: "Bfrtip",
				buttons: [
					{
						extend: "copy",
						className: "btn-sm"
					},
					{
						extend: "csv",
						className: "btn-sm"
					},
					{
						extend: "excel",
						className: "btn-sm"
					},
					{
						extend: "pdfHtml5",
						className: "btn-sm"
					},
					{
						extend: "print",
						className: "btn-sm"
					},
				],
				responsive: true
			});
		}
	};

	TableManageButtons = function () {
		"use strict";
		return {
			init: function () {
				handleDataTableButtons();
			}
		};
	}();

	$('#datatable').dataTable();

	$('#datatable-keytable').DataTable({
		keys: true
	});

	$('#datatable-responsive').DataTable();

	$('#datatable-scroller').DataTable({
		ajax: "js/datatables/json/scroller-demo.json",
		deferRender: true,
		scrollY: 380,
		scrollCollapse: true,
		scroller: true
	});

	$('#datatable-fixed-header').DataTable({
		fixedHeader: true
	});

	var $datatable = $('#datatable-checkbox');

	$datatable.dataTable({
		'order': [[1, 'asc']],
		'columnDefs': [
			{ orderable: false, targets: [0] }
		]
	});
	$datatable.on('draw.dt', function () {
		$('checkbox input').iCheck({
			checkboxClass: 'icheckbox_flat-green'
		});
	});

	TableManageButtons.init();

};



function init_valoresLidos() {
	var id = localStorage.getItem("idCliente");
	if ($('#tabela').length) {

		$.ajax({
			url: url + "tabelaValores.php",
			type: 'GET',
			data: { id: id },
			success: function (data) {
				for (var i in data) {
					$('#tabela tbody').append("<tr><td>" + data[i].valor + "</td><td>" + data[i].data + "</td><td>" + data[i].horas +
						"</td></tr>");
				}
			},
			error: function () {
				console.log('error');
			}
		});
	}

	if ($('#valoresLinhas').length) {
		$.ajax({
			type: 'GET',
			url: url + "valoresLinha.php",
			data: { id: id },
			success: function (data) {
				var valores = [];
				var labels = [];

				for (var i in data) {
					valores.push(parseInt(data[i].valor));
					labels.push(data[i].data);
				}

				var chartdata = {
					labels: labels,
					datasets: [
						{
							label: "Valor leitura",
							backgroundColor: "rgba(38, 185, 154, 0.31)",
							borderColor: "rgba(38, 185, 154, 0.7)",
							pointBorderColor: "rgba(38, 185, 154, 0.7)",
							pointBackgroundColor: "rgba(38, 185, 154, 0.7)",
							pointHoverBackgroundColor: "#fff",
							pointHoverBorderColor: "rgba(220,220,220,1)",
							pointBorderWidth: 1,
							data: valores
						}
					]
				}
				var ctx = $("#valoresLinhas");

				lineGraph = new Chart(ctx, {
					type: 'line',
					data: chartdata,
					options: {
						scales: {
							yAxes: [{
								scaleLabel: {
									display: true,
									labelString: 'Valores lidos'
								},
								ticks: {
									beginAtZero: true,

								}
							}],
							xAxes: [{
								scaleLabel: {
									display: true,
									labelString: "Data"
								}
							}]
						}
					}

				});
				document.getElementById('js-legend3').innerHTML = lineGraph.generateLegend();

			}
		});

	}

	if ($('#valoresLimite').length) {

		$.ajax({
			url: url + "tipoLeituras.php",
			method: "GET",
			data: { id: id },
			success: function (data) {
				var valores = [];
				var label = [];
				var sup = 0;
				var inf = 0;
				var normal = 0;

				label.push("Valores superiores");
				label.push("Valores inferiores");
				label.push("Valores normais");

				for (var i in data) {
					if (parseInt(data[i].li) <= parseInt(data[i].valor) && parseInt(data[i].ls) >= parseInt(data[i].valor)) {
						normal++;
					}
					else if (parseInt(data[i].li) > parseInt(data[i].valor))
						inf++;
					else sup++;
				}

				valores.push(sup);
				valores.push(inf);
				valores.push(normal);



				var colors = [
					"#336600", "#990000", "#003366"
				];

				var chartdata = {
					labels: label,
					datasets: [
						{
							label: "Total de Acessos Negados",
							backgroundColor: colors,
							data: valores,
						}
					]
				};

				var ctx = $('#valoresLimite');

				pieChart = new Chart(ctx, {
					data: chartdata,
					type: 'pie'

				});
				document.getElementById('js-legend1').innerHTML = pieChart.generateLegend();

			},
			error: function (data) {
				console.log(data);
			}
		});

	}

	if ($('#nome').length) {

		$.ajax({

			url: url + "caractUser.php",
			method: "GET",
			data: { id: id },
			success: function (data) {
				var nome = "";
				var li = 0;
				var ls = 0;

				for (var i in data) {
					nome = data[i].nome;
					li = data[i].li;
					ls = data[i].ls;
				}

				document.getElementById('nome').innerHTML = "Nome: " + nome;
				document.getElementById('ls').innerHTML = "Limite Superior: " + ls;
				document.getElementById('li').innerHTML = "Limite Inferior: " + li;

			}
		})

	}
}

function init_mapGraphs() {
	if ($('#maxEmin').length) {

		$.ajax({

			url: url + "maxMin.php",
			method: "GET",
			data: {},
			success: function (data) {
				var valoresMaximos = [];
				var valoresMinimos = [];
				var labels = [];

				for (var i in data) {
					valoresMaximos.push(parseInt(data[i].maxs))
					valoresMinimos.push(parseInt(data[i].mins))
					labels.push((data[i].id))
				}

				var chartdata = {
					labels: labels,
					datasets: [
						{
							label: "Máximo lido",
							backgroundColor: "rgba(300, 00, 0, 0.7)",
							data: valoresMaximos
						},
						{
							label: "Mínimo lido",
							backgroundColor: "rgba(0, 0, 300, 0.7)",
							data: valoresMinimos
						}

					]
				};

				var ctx = $('#maxEmin');

				barGraph = new Chart(ctx, {
					type: 'bar',
					data: chartdata,
					options: {
						scales: {
							yAxes: [{
								scaleLabel: {
									display: true,
									labelString: 'Valor lido'
								},
								ticks: {
									beginAtZero: true
								}
							}],
							xAxes: [{
								scaleLabel: {
									display: true,
									labelString: 'Id do Sensor'
								}
							}]
						}
					}

				});
				document.getElementById('js-legend2').innerHTML = barGraph.generateLegend();
			},
		})

	}

	if ($('#avgLinhas').length) {
		$.ajax({
			type: 'GET',
			url: url + "avgSensores.php",
			data: {},
			success: function (data) {
				var valores = [];
				var labels = [];

				for (var i in data) {
					valores.push(parseInt(data[i].avgs));
					labels.push(data[i].id);
				}

				var chartdata = {
					labels: labels,
					datasets: [
						{
							label: "Valor Médio dos sensores",
							backgroundColor: "rgba(38, 185, 154, 0.31)",
							borderColor: "rgba(38, 185, 154, 0.7)",
							pointBorderColor: "rgba(38, 185, 154, 0.7)",
							pointBackgroundColor: "rgba(38, 185, 154, 0.7)",
							pointHoverBackgroundColor: "#fff",
							pointHoverBorderColor: "rgba(220,220,220,1)",
							pointBorderWidth: 1,
							data: valores
						}
					]
				}
				var ctx = $("#avgLinhas");

				lineGraph = new Chart(ctx, {
					type: 'line',
					data: chartdata,
					options: {
						scales: {
							yAxes: [{
								scaleLabel: {
									display: true,
									labelString: 'Valore Médio'
								},
								ticks: {
									beginAtZero: true,

								}
							}],
							xAxes: [{
								scaleLabel: {
									display: true,
									labelString: "Id do Sensor"
								}
							}]
						}
					}

				});
				document.getElementById('js-legend3').innerHTML = lineGraph.generateLegend();

			}
		});
	}

}

window.onload = function () {
	var id = localStorage.getItem("idCliente");
	var myLatLng = { lat: 41.56131, lng: -8.393804 };
	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 15,
		center: myLatLng
	});

	$.ajax({

		url: url + "localSensores.php",
		method: "GET",
		success: function (data) {

			for (var i in data) {
				var titlo = "id: " + data[i].id + " detalhes: " + data[i].detalhes
				var pointLocal = { lat: parseFloat(data[i].gpsX), lng: parseFloat(data[i].gpsY) };
				var marker = new google.maps.Marker({
					position: pointLocal,
					map: map,
					title: titlo
				});

				if (parseInt(data[i].de) == 1)
					marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');

			}


		}
	})





	//marker.addListener('click', function() {
	//	document.getElementById('sss').innerHTML = "DAMN"
	//});
}

function registarUser(nome, password) {
	var flagRegistar = 0;
	$.ajax({

		url: url + "verSeNomeExiste.php",
		method: "POST",
		data: { nome: nome, password: password },
		success: function (data) {
			flagRegistar = data;
			if (flagRegistar == "1") {
				window.alert("O user escolhido já existe");
			}
			else {
				window.alert("User inserido com sucesso");
				location.href = 'pag_inicial2.html';
			}
		}
	})
}

function logIN(nome, password) {
	var flaglogin = 0;
	$.ajax({

		url: url + "logInUser.php",
		method: "POST",
		data: { nome: nome, password: password },
		success: function (data) {
			flaglogin = parseInt(data);
			if (flaglogin != "-1" && flaglogin != "0") {
				window.alert("LogIn com sucesso");
				localStorage.setItem("idCliente", flaglogin);
				location.href = 'paginaMapa.html';
			}
			if (flaglogin == "0") {
				window.alert("Password Errada");
			}
			if (flaglogin == "-1") {
				window.alert("UserName não existe");
			}
		}
	})
}

function init_actualizar(inf, sup) {
	var tipo;
	var id = localStorage.getItem("idCliente");
	if (inf == "" && sup == "") window.alert("Por Favor insira em pelo menos um dos campos");
	else if (inf == "") { tipo = 1; inf = 0; }
	else if (sup == "") { tipo = 2; sup = 0; }
	else tipo = 3;
	inf = parseInt(inf);
	sup = parseInt(sup);
	$.ajax({

		url: url + "actLimites.php",
		method: "POST",
		data: { inf: inf, sup: sup, tipo: tipo, id: id },
		success: function (data) {
			if (tipo == 1)
				window.alert("Valor máximo do sensor actualizado");
			if (tipo == 2)
				window.alert("Valor mínimo do sensor actualizado");
			if (tipo == 3)
				window.alert("Valores máximo e mínimo do sensor actualizado");
			location.reload();
		},
		error: function (data) {
			console.log(data);
		}
	})
}

function add_Sensor(x, y, detalhes) {
	var emEdificio = 0;
	var id = localStorage.getItem("idCliente");
	if (x == "" || y == "") window.alert("Por Favor prencha os campos das posições X e Y");
	x = parseFloat(x);
	y = parseFloat(y);
	if (detalhes != "") emEdificio = 1;
	$.ajax({

		url: url + "addLocalSensor.php",
		method: "POST",
		data: { x: x, y: y, emEdificio: emEdificio, id: id, detalhes: detalhes },
		success: function (data) {
			var mensagem = "Sensor instalado em " + x + "," + y;
			window.alert(mensagem);
			location.href = 'paginaMapa.html';
		},
		error: function (data) {
			console.log(data);
		}
	})
}

function table_alarmes() {

	if ($('#tableUser').length) {
		$.ajax({

			url: url + "users.php",
			method: "GET",
			data: {},
			success: function (data) {
				for (var i in data) {
					$('#tableUser tbody').append("<tr><td>" + data[i].Username + "</td><td>" + data[i].Account_Status + "</td><td>" + data[i].Default_Tablespace +
						"</td><td>" + data[i].Temporary_Tablespace + "</td><td>" + data[i].Created + "</td><td>" + data[i].Last_login + 
						"</td><td>" + data[i].Date + "</td></tr>");
				}
			},
			error: function (data) {
				console.log(data);
			}
		})
	}

	if ($('#tableSpace').length) {
		$.ajax({
			url: url + "mongoDBteste.php",
			method: "GET",
			data: {},
			success: function (data) {
				for (var i in data) {
					$('#tableSpace tbody').append("<tr><td>" + data[i].Tablespace + "</td><td>" + data[i].FILE_NAME + "</td><td>" + data[i].Used_MB +
						"</td><td>" + data[i].Total_MB + "</td><td>" + data[i].Data + "</td></tr>");
				}
			},
			error: function (data) {
				console.log(data);
			}
		})
	}

	if ($('#IOBar').length) {

		$.ajax({
			url: url + "io.php",
			method: "GET",
			data: {},
			success: function (data) {
				var writes = [];
				var reads = [];
				var labels = [];
				var blocks = [];

				for (var i in data) {
					reads.push(parseInt(data[i].Physical_Reads))
					writes.push(parseInt(data[i].Physical_Writes))
					labels.push((data[i].Name))
					blocks.push((data[i].Total_Block))
				}

				var chartdata = {
					labels: labels,
					datasets: [
						{
							label: "Physical_Reads",
							backgroundColor: "rgba(300, 00, 0, 0.7)",
							data: reads
						},
						{
							label: "Physical_Writes",
							backgroundColor: "rgba(0, 0, 300, 0.7)",
							data: writes
						},
						{
							label: "Total Block",
							backgroundColor: "rgba(0, 300, 0, 0.7)",
							data: blocks
						}

					]
				};

				var ctx = $('#IOBar');

				barGraph = new Chart(ctx, {
					type: 'bar',
					data: chartdata,
					options: {
						scales: {
							yAxes: [{
								scaleLabel: {
									display: true,
									labelString: '# acções'
								},
								ticks: {
									beginAtZero: true
								}
							}],
							xAxes: [{
								scaleLabel: {
									display: true,
									labelString: 'Nome do utilizador'
								}
							}]
						}
					}

				});
			},
		})

	}



	if ($('#maxEmin').length) {
		$.ajax({
			url: url + "io.php",
			method: "GET",
			data: {},
			success: function (data) {
				console.log(data);
				var reads = [];
				var writes = [];
				var labels = [];	

				for (var i in data) {
					valores.push(parseInt(data[i].age));
					labels.push(data[i].first_name);
				}

				var chartdata = {
					labels: labels,
					datasets: [
						{
							label: "Valor Médio dos sensores",
							backgroundColor: "rgba(38, 185, 154, 0.31)",
							borderColor: "rgba(38, 185, 154, 0.7)",
							pointBorderColor: "rgba(38, 185, 154, 0.7)",
							pointBackgroundColor: "rgba(38, 185, 154, 0.7)",
							pointHoverBackgroundColor: "#fff",
							pointHoverBorderColor: "rgba(220,220,220,1)",
							pointBorderWidth: 1,
							data: valores
						},
						{
							label: "Valor Médio dos sensores",
							backgroundColor: "rgba(38, 185, 154, 0.31)",
							borderColor: "rgba(38, 185, 154, 0.7)",
							pointBorderColor: "rgba(38, 185, 154, 0.7)",
							pointBackgroundColor: "rgba(38, 185, 154, 0.7)",
							pointHoverBackgroundColor: "#fff",
							pointHoverBorderColor: "rgba(220,220,220,1)",
							pointBorderWidth: 1,
							data: valores
						}
					]
				}
				var ctx = $("#maxEmin");

				lineGraph = new Chart(ctx, {
					type: 'line',
					data: chartdata,
					options: {
						scales: {
							yAxes: [{
								scaleLabel: {
									display: true,
									labelString: 'Valore Médio'
								},
								ticks: {
									beginAtZero: true,

								}
							}],
							xAxes: [{
								scaleLabel: {
									display: true,
									labelString: "Id do Sensor"
								}
							}]
						}
					}

				});

				//document.getElementById('nome').innerHTML = data;
			}, error: function (data) {
				console.log(data);
			}
		})
	}
}


/*function table_alarmes(){
	if ($('#tabelaAlertas').length ){
	var nporLer = parseInt(localStorage.getItem("porLer"));
	var jaLidos = parseInt(localStorage.getItem("lidos"));
	if (isNaN(jaLidos)) jaLidos = 0;
	var auxReg = 0;
	var reg = 0;
	$.ajax({

		url: url + "alarmes.php",
		method: "GET",
		data: {},
		success: function(data) {
			
			for(var i in data){
				if(parseInt(data[i].valor) < parseInt(data[i].li)){
					$('#tabelaAlertas tbody').append("<tr><td>" + data[i].nome + "</td><td>" + data[i].valor + "</td><td>" + "Limite Inferior: " + data[i].li +
							"</td><td>" + data[i].dia + "</td><td>" + data[i].horas + "</td></tr>" );		
				}
				else{
					$('#tabelaAlertas tbody').append("<tr><td>" + data[i].nome + "</td><td>" + data[i].valor + "</td><td>" + "Limite Superior: " + data[i].ls +
							"</td><td>" + data[i].dia + "</td><td>" + data[i].horas + "</td></tr>" );
				}
				reg++;
			}
			auxReg = reg - jaLidos;
			reg =  auxReg + jaLidos;
			localStorage.setItem("lidos", reg);
		},
		error : function(data){
			console.log(data);
		}
	})
}	
}*/

function init_alarmes() {
	var nporLer = parseInt(localStorage.getItem("porLer"));
	var jaLidos = parseInt(localStorage.getItem("lidos"));
	if (isNaN(jaLidos)) jaLidos = 0;
	var reg = 0;
	$.ajax({

		url: url + "alarmes.php",
		method: "GET",
		data: {},
		success: function (data) {

			for (var i in data) {
				reg++;
			}
			nporLer = reg - jaLidos;
			if (nporLer != 0) {
				var mensagem = "Existem " + nporLer + " irregularidades que deviam ser vistas";
				window.alert(mensagem);
			}
		},
		error: function (data) {
			console.log(data);
		}
	})
}

function valoresSensores() {
	if ($('#valoresAtuais').length) {
		$.ajax({
			type: 'GET',
			url: url + "valoresAtuais.php",
			data: {},
			success: function (data) {
				var valores = [];
				var labels = [];

				for (var i in data) {
					valores.push(parseInt(data[i].valor));
					labels.push(data[i].id);
				}

				var chartdata = {
					labels: labels,
					datasets: [
						{
							label: "Valor Médio dos sensores",
							backgroundColor: "rgba(38, 185, 154, 0.31)",
							borderColor: "rgba(38, 185, 154, 0.7)",
							pointBorderColor: "rgba(38, 185, 154, 0.7)",
							pointBackgroundColor: "rgba(38, 185, 154, 0.7)",
							pointHoverBackgroundColor: "#fff",
							pointHoverBorderColor: "rgba(220,220,220,1)",
							pointBorderWidth: 1,
							data: valores
						}
					]
				}
				var ctx = $("#avgLinhas");

				lineGraph = new Chart(ctx, {
					type: 'line',
					data: chartdata,
					options: {
						scales: {
							yAxes: [{
								scaleLabel: {
									display: true,
									labelString: 'Valore Médio'
								},
								ticks: {
									beginAtZero: true,

								}
							}],
							xAxes: [{
								scaleLabel: {
									display: true,
									labelString: "Id do Sensor"
								}
							}]
						}
					}

				});
				document.getElementById('js-legend1').innerHTML = lineGraph.generateLegend();

			}
		});
	}
}









$(document).ready(function () {
	table_alarmes();

	init_sidebar();
	init_InputMask();
	init_TagsInput();
	init_parsley();
	init_SmartWizard();
	init_DataTables();
	init_PNotify();
	init_CustomNotification();
	init_autosize();
});


