from pyteal import *


class Poll:
    class Variables:
        title = Bytes("TITLE")
        creator = Bytes("CREATOR")
        options = Bytes("OPTIONS")
        # choice = bytes("CHOICE")
        voted = Bytes("VOTED")
        # voted = Bytes("VOTED") #number of votes
        # votingOptions = Arr("OPTIONS", Int())

    class AppMethods:
        vote = Bytes("vote")

    def application_creation(self):
        return Seq([
            Assert(Txn.application_args.length() == Int(3)),
            Assert(Txn.note() == Bytes("polling-system:uv1")),
            App.globalPut(self.Variables.title, Txn.application_args[0]),
            App.globalPut(self.Variables.creator, Txn.application_args[1]),
            App.globalPut(self.Variables.options, Txn.application_args[2]),
            App.globalPut(self.Variables.voted, Int(0)),
            Approve()
        ])

    def vote(self):
        # count = Txn.application_args[1]
        valid_number_of_transactions = Global.group_size() == Int(2)

        # valid_payment_to_seller = And(
        #     Gtxn[1].type_enum() == TxnType.Payment,
        #     Gtxn[1].receiver() == Global.creator_address(),
        #     Gtxn[1].amount() == App.globalGet(self.Variables.price) * Btoi(count),
        #     Gtxn[1].sender() == Gtxn[0].sender(),
        # )

        can_vote = And(valid_number_of_transactions)

        update_state = Seq([
            App.globalPut(self.Variables.voted, App.globalGet(self.Variables.voted) + Btoi(Bytes("1"))),
            Approve()
        ])

        return If(can_vote).Then(update_state).Else(Reject())

    def application_deletion(self):
        return Return(Txn.sender() == Global.creator_address())

    def application_start(self):
        return Cond(
            [Txn.application_id() == Int(0), self.application_creation()],
            [Txn.on_completion() == OnComplete.DeleteApplication, self.application_deletion()],
            [Txn.application_args[0] == self.AppMethods.vote, self.vote()]
        )

    def approval_program(self):
        return self.application_start()

    def clear_program(self):
        return Return(Int(1))