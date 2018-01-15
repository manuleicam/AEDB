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
var user;
var MS_PER_MINUTE = 60000;
var ate = new Date(moment());
var de = new Date(ate - 2 * MS_PER_MINUTE);


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

// relogio





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


//document.getElementById('js-legend1').innerHTML = pieChart.generateLegend();



function userInfo(element) {
	var table = document.getElementById('tableSpace');
	var userName = table.rows[element.closest('tr').rowIndex].cells[element.closest('td').cellIndex].innerHTML;
	var res = userName.split("/");
	console.log(res[7]);
	//window.location='IO_SESSIONS.html'
	localStorage.setItem("user", res[7]);
	userPrint = localStorage.getItem("user")
	window.location = 'userPage.html'

}

function lineGraphs(de, ate) {
	var ate2 = new Date(moment());
	var myStartDate = new Date(ate2 - 10 * MS_PER_MINUTE);
	
	if ($('#IOGraph').length) {
		console.log(myStartDate)
		console.log(ate2);
		$.ajax({
			url: url + "IOSUM.php",
			method: "GET",
			data: {},
			success: function (data) {
				var reads = [];
				var writes = [];
				var labels = [];
				var blocks = [];

				for (var i in data) {
					if (Date.parse(data[i]._id) > myStartDate && Date.parse(data[i]._id) <= ate2) {
						reads.push(parseInt(data[i].reads))
						writes.push(parseInt(data[i].writes))
						blocks.push((data[i].blocks))
						labels.push(data[i]._id)
					}
				}

				var chartdata = {
					labels: labels,
					datasets: [
						{
							label: "Physical_Reads",
							backgroundColor: "rgba(0, 300, 0, 0.7)",
							data: reads
						},
						{
							label: "Physical_Writes",
							backgroundColor: "rgba(0, 0, 300, 0.7)",
							data: writes
						},
						{
							label: "Total Block",
							backgroundColor: "rgba(300, 00, 0, 0.7)",
							data: blocks
						}
					]
				}
				var ctx = $("#IOGraph");

				lineGraph = new Chart(ctx, {
					type: 'line',
					data: chartdata,
					options: {
						scales: {
							yAxes: [{
								scaleLabel: {
									display: true,
									labelString: 'Valores'
								},
								ticks: {
									beginAtZero: true,

								}
							}],
							xAxes: [{
								scaleLabel: {
									display: true,
									labelString: "Data da Leitura"
								}
							}]
						}
					}

				});
			}, error: function (data) {
				console.log(data);
			}
		})

		$.ajax({
			url: url + "cpuUsageSUM.php",
			method: "GET",
			data: {},
			success: function (data) {
				var cpuUsage = [];
				var labels = [];

				for (var i in data) {
					if (Date.parse(data[i]._id) > myStartDate && Date.parse(data[i]._id) <= ate2) {
						cpuUsage.push(parseFloat(data[i].cpu))
						labels.push(data[i]._id)

					}
				}

				var chartdata = {
					labels: labels,
					datasets: [
						{
							label: "Tempo de cpu gasto",
							backgroundColor: "rgba(0, 300, 0, 0.7)",
							data: cpuUsage
						},

					]
				}
				var ctx = $("#sessionGraphLine");

				lineGraph = new Chart(ctx, {
					type: 'line',
					data: chartdata,
					options: {
						scales: {
							yAxes: [{
								scaleLabel: {
									display: true,
									labelString: 'Cpu time (seconds)'
								},
								ticks: {
									beginAtZero: true,

								}
							}],
							xAxes: [{
								scaleLabel: {
									display: true,
									labelString: "Data da Leitura"
								}
							}]
						}
					}

				});
			}, error: function (data) {
				console.log(data);
			}
		})

	}
}

function userPage(de, ate) {
	if ($('#IOBarUser').length) {

		userName = localStorage.getItem("user");
		document.getElementById('userName').innerHTML = userName;
		$.ajax({
			url: url + "io.php",
			method: "GET",
			data: {},
			success: function (data) {
				var reads = [];
				var writes = [];
				var labels = [];
				var blocks = [];

				for (var i in data) {
					if (Date.parse(data[i].Date) > de && Date.parse(data[i].Date) <= ate) {
						var res = data[i].Name.split("/");
						if (res[7] == userName) {
							reads.push(parseInt(data[i].Physical_Reads))
							writes.push(parseInt(data[i].Physical_Writes))
							blocks.push((data[i].Total_Block))
							labels.push(data[i].Date)
						}
					}
				}

				var chartdata = {
					labels: labels,
					datasets: [
						{
							label: "Physical_Reads",
							backgroundColor: "rgba(0, 300, 0, 0.7)",
							data: reads
						},
						{
							label: "Physical_Writes",
							backgroundColor: "rgba(0, 0, 300, 0.7)",
							data: writes
						},
						{
							label: "Total Block",
							backgroundColor: "rgba(300, 00, 0, 0.7)",
							data: blocks
						}
					]
				}
				var ctx = $("#IOBarUser");

				lineGraph = new Chart(ctx, {
					type: 'line',
					data: chartdata,
					options: {
						scales: {
							yAxes: [{
								scaleLabel: {
									display: true,
									labelString: 'Valores'
								},
								ticks: {
									beginAtZero: true,

								}
							}],
							xAxes: [{
								scaleLabel: {
									display: true,
									labelString: "Data da Leitura"
								}
							}]
						}
					}

				});
			}, error: function (data) {
				console.log(data);
			}
		})

		$.ajax({
			url: url + "session.php",
			method: "GET",
			data: {},
			success: function (data) {
				var cpuUsage = [];
				var labels = [];

				for (var i in data) {
					if (Date.parse(data[i].Date) > de && Date.parse(data[i].Date) <= ate) {
						if (data[i].Username == userName) {
							cpuUsage.push(parseFloat(data[i].cpu_usage))
							labels.push(data[i].Data)
						}
					}
				}

				var chartdata = {
					labels: labels,
					datasets: [
						{
							label: "Physical reads",
							borderColor: "#2F4F4F",
							pointBackgroundColor: "#2F4F4F",
							data: cpuUsage
						}
					]
				}
				var ctx = $("#sessionLineUser");

				barGraph = new Chart(ctx, {
					type: 'line',
					data: chartdata,
					options: {
						scales: {
							yAxes: [{
								scaleLabel: {
									display: true,
									labelString: 'Uso do Cpu (Segundos)'
								},
								ticks: {
									beginAtZero: true,

								}
							}],
							xAxes: [{
								scaleLabel: {
									display: true,
									labelString: "Data da Leitura"
								}
							}]
						}
					}

				});
			}, error: function (data) {
				console.log(data);
			}
		})
	}
}

function graficosGerais(de, ate) {

	if ($('#tableUser').length) {
		$.ajax({
			url: url + "users.php",
			method: "GET",
			data: {},
			success: function (data) {
				for (var i in data) {

					var date = new Date(data[i].Created.sec);
					if (data[i].Last_login!= null)var log = new Date(data[i].Last_login.sec)
					else var log = null;
					if (Date.parse(data[i].Date) > de && Date.parse(data[i].Date) <= ate) {
						$('#tableUser tbody').append("<tr><td>" + data[i].Username + "</td><td>" + data[i].Account_Status + "</td><td>" + data[i].Default_Tablespace +
							"</td><td>" + data[i].Temporary_Tablespace + "</td><td>" + date + "</td><td>" + log +
							"</td><td>" + data[i].Date + "</td></tr>");
					}
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
					
					if (Date.parse(data[i].Date) > de && Date.parse(data[i].Date) <= ate) {
						$('#tableSpace tbody').append("<tr><td>" + data[i].Tablespace + "</td><td onclick= userInfo(this)>" + data[i].FILE_NAME + "</td><td>" + data[i].Used_MB +
							"</td><td>" + data[i].Total_MB + "</td><td>" + data[i].Date + "</td></tr>");
					}
				}
			},
			error: function (data) {
				console.log(data);
			}
		})
	}

	if ($('#IOBar').length) {

		//de.setHours(de.getHours() - 6);
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

					var res = data[i].Name.split("/");

					var aux = new Date('2018/01/15 15:34:00')
					if (Date.parse(data[i].Date) > de && Date.parse(data[i].Date) <= ate) {
						reads.push(parseInt(data[i].Physical_Reads))
						writes.push(parseInt(data[i].Physical_Writes))
						labels.push(res[7])
						blocks.push((data[i].Total_Block))
					}
				}

				var chartdata = {
					labels: labels,
					datasets: [
						{
							label: "Physical_Reads",
							backgroundColor: "rgba(0, 300, 0, 0.7)",
							data: reads
						},
						{
							label: "Physical_Writes",
							backgroundColor: "rgba(0, 0, 300, 0.7)",
							data: writes
						},
						{
							label: "Total Block",
							backgroundColor: "rgba(300, 00, 0, 0.7)",
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
									labelString: 'Data Files'
								}
							}]
						}
					}

				});
			},
		})

		$.ajax({
			url: url + "wait.php",
			method: "GET",
			data: {},
			success: function (data) {
				var total = 0;
				var flag = 0;
				var valores = [];
				var razao = [];

				for (var i in data) {
					if (Date.parse(data[i].Date) > de && Date.parse(data[i].Date) <= ate) {
						if (flag < 3) {
							razao.push(data[i].Class);
							valores.push(parseInt(data[i].Time));
							flag++;
						}
						else {
							total = total + parseInt(data[i].Time);
						}
					}
				}
				valores.push(total);
				razao.push("Resto");
				var colors = [
					"#2F4F4F", "#008080","#7f8e9e"
				];

				var chartdata = {
					labels: razao,
					datasets: [
						{
							label: "Tempo de espera",
							backgroundColor: colors,
							data: valores,
						}
					]
				};

				var ctx = $('#waitPie');

				pieChartNegadosRazoes = new Chart(ctx, {
					data: chartdata,
					type: 'pie'

				});
			},
			error: function (data) {
				console.log(data);
			}
		});

	}



	if ($('#sessionLine').length) {
		$.ajax({
			url: url + "session.php",
			method: "GET",
			data: {},
			success: function (data) {
				var cpuUsage = [];
				var labels = [];
				var colors = [
					"#2F4F4F", "#008080", "#2E8B57", "#3CB371", "#90EE90", "#4279a3", "#476c8a", "#49657b", "#7f8e9e"
				];

				for (var i in data) {
					if (Date.parse(data[i].Date) > de && Date.parse(data[i].Date) <= ate) {
						cpuUsage.push(parseFloat(data[i].cpu_usage))
						labels.push(data[i].Username)
					}
				}

				var chartdata = {
					labels: labels,
					datasets: [
						{
							label: "Tempo de uso do cpu da session",
							backgroundColor: "rgba(0, 300, 0, 0.7)",
							data: cpuUsage
						}
					]
				}
				var ctx = $("#sessionLine");

				lineGraph = new Chart(ctx, {
					type: 'bar',
					data: chartdata,
					options: {
						scales: {
							yAxes: [{
								scaleLabel: {
									display: true,
									labelString: 'cpu usado (segundos)'
								},
								ticks: {
									beginAtZero: true,

								}
							}],
							xAxes: [{
								scaleLabel: {
									display: true,
									labelString: "Nome da sessão"
								}
							}]
						}
					}

				});
			}, error: function (data) {
				console.log(data);
			}
		})
	}
}

function changeData(value) {

	switch (value) {
		case "1":
			de = new Date(moment().startOf('day'));
			ate = new Date(moment());
			var myStartDate = new Date(ate - 2 * MS_PER_MINUTE);
			break;
		case "2":
			de = new Date(moment().subtract(1, 'days').startOf('day'));
			ate = new Date(moment().subtract(1, 'days').endOf('day'));
			var myStartDate = new Date(ate - 2 * MS_PER_MINUTE);
			break;
		case "5":
			de = new Date(moment().subtract(1, 'month').startOf('month'));
			ate = new Date(moment().subtract(1, 'month').endOf('month'));
			var myStartDate = new Date(ate - 2 * MS_PER_MINUTE);
			break;
		case "7":
			de = new Date(moment().subtract(1, 'year').startOf('year'));
			ate = new Date(moment().subtract(1, 'year').endOf('year'));
			var myStartDate = new Date(ate - 2 * MS_PER_MINUTE);
			break;
	}
	initGraphs(myStartDate, ate);
}


$('#mySelect').on('change', function () {
	var value = $(this).val();
	changeData(value);
});

function destroyGraphs() {
	if ($('#tableUser').length) { //pagina das tabelas
		$("#tableUser  tbody tr").remove();
		$("#tableSpace  tbody tr").remove();
	}
	if ($('#IOBar').length) { //pagina dos gráficos
		barGraph.destroy();
		lineGraph.destroy();
	}
	if ($('#IOBarUser').length) { //pagina utilizador
		lineGraph.destroy();
		barGraph.destroy();
	}
}

function initGraphs(de, ate) {
	destroyGraphs();
	graficosGerais(de,ate);
	userPage(de, ate);
}

function init_all(de, ate){
	graficosGerais(de, ate);
	userPage(de, ate);
	lineGraphs(de, ate)
}


$(document).ready(function () {
	init_all(de, ate);

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


