'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async createInvoice(ctx){
        let {body} = ctx.request;
        let item_list = body.items;
        let customer = body.customer;
        let bill = body.bill;

        // Customer Info

        let customer_dt = await strapi.services.customer.find({
            mobile:customer.mobile,
            shop:ctx.state.shop
        });
        let customer_info;
        if(customer_dt.length === 0){
            customer_info = await strapi.services.customer.create({...customer,shop:ctx.state.shop});
        }
        else{
            customer_info = customer_dt[0];
        }

        // Invoice ornaments details

        let item_id = [];
        for(let it of item_list){
            if(it.id == undefined){
                let temp_it = await strapi.services.ornaments.create({...it, status:1,shop:ctx.state.shop});
                item_id.push(temp_it.id);
                console.log("New Item", temp_it);
            }
            else{
                let obj = it;
                let temp_it = await strapi.services.ornaments.update({id:it.id},{...obj, status:1});
                item_id.push(temp_it.id);
                console.log("New Item", temp_it);
            }
        }

        console.log(item_id);

        // Invoice insertion and transactions

        let invoice;
        if(bill.id === undefined){
            console.log("New Bill");
            invoice = await strapi.services.invoices.create({...bill, items:item_id, customer:customer_info.id , shop:ctx.state.shop});
            console.log(invoice);
            await strapi.services['invoice-transactions'].create({invoice:invoice.id, date: invoice.date, amount: invoice.amount});
        }
        else{
            invoice = await strapi.services.invoices.update({id:bill.id},{...bill, items:item_id, customer:customer_info.id});
            let transactions = await strapi.services['invoice-transactions'].find({invoice:invoice.id});
            if(transactions.length == 1){
                await strapi.services['invoice-transactions'].update({id:transactions[0].id}, {invoice:invoice.id, date: invoice.date, amount: invoice.amount});
            }
            else if(transactions.length > 1){
                let new_amount = 0;
                for(let tx of transactions){
                    new_amount = new_amount + tx.amount;
                }
                if(new_amount > invoice.amount){
                    await strapi.services['invoice-transactions'].update({id:transactions[0].id}, {invoice:invoice.id, date: invoice.date, amount: transactions[0].amount - (new_amount - invoice.amount)});
                }
                else if(new_amount < invoice.amount){
                    await strapi.services['invoice-transactions'].update({id:transactions[0].id}, {invoice:invoice.id, date: invoice.date, amount: transactions[0].amount - (invoice.amount - new_amount)});
                }
            }
            console.log("Old Bill", invoice);
        }

        //Update last invoice number
        let shop_dtls = await strapi.services['shops'].findOne({
            id:ctx.state.shop
        });
        if(shop_dtls.last_invoice.length > 0){
            shop_dtls.last_invoice[0] = bill.number;
            await strapi.services['shops'].update({id:shop_dtls.id}, {...shop_dtls});
        }
        else{
            shop_dtls.last_invoice = [bill.number];
            await strapi.services['shops'].update({id:shop_dtls.id}, {...shop_dtls});
        }

        return invoice;       

    }
};
