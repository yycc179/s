function select_draw(name, data, current) {
    var op = $(`<option value=${data[0]}>${data[1]}</option>)`);
    if (data[0] == current) op.attr('selected', true);
    // var op = $(`<option value=${key}>${value}</option>)`);
    // if (key == current) op.attr('selected', true);
    $(name).append(op);
}