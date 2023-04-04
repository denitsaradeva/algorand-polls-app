from pyteal import *

class Poll:
    class Variables:
        title = Bytes("Title")
        creator = Bytes("Creator")
        options = Bytes("VotingChoices")
        end = Bytes("EndTime")

    class AppMethods:
        vote = Bytes("vote")

    def application_start(self):
    
        on_creation = Seq([
            Assert(Txn.application_args.length() == Int(3)),
            App.globalPut(self.Variables.title, Txn.application_args[0]),
            App.globalPut(self.Variables.options, Txn.application_args[1]),
            App.globalPut(self.Variables.end, Btoi(Txn.application_args[2])),
            App.globalPut(self.Variables.creator, Txn.sender()),
            Approve()
        ])
        
        is_creator = Txn.sender() == App.globalGet(self.Variables.creator)
        get_vote_of_sender = App.localGetEx(Int(0), App.id(), Bytes("voted"))
        
        on_register = Return(Int(1))

        choice = Txn.application_args[1]
        choice_tally = App.globalGet(choice)
        
        check_choice = If(choice_tally > Int(0), App.globalPut(choice, choice_tally + Int(1)), App.globalPut(choice, Int(1)))
        
        on_vote = Seq([
            If((Global.latest_timestamp() > App.globalGet(Bytes("EndTime"))), Return(Int(0))),
            get_vote_of_sender,
            If(get_vote_of_sender.hasValue(), Return(Int(0))),
            check_choice,
            App.localPut(Int(0), Bytes("voted"), choice),
            Return(Int(1)),
        ])
        
        program = Cond(
            [Txn.application_id() == Int(0), on_creation],
            [Txn.on_completion() == OnComplete.DeleteApplication, Return(is_creator)],
            [Txn.on_completion() == OnComplete.UpdateApplication, Return(is_creator)],
            [Txn.on_completion() == OnComplete.OptIn, on_register],
            [Txn.on_completion() == OnComplete.NoOp, on_vote],
        )

        return program
        
    def approval_program(self):
        return self.application_start()

    def clear_program(self):
        return Return(Int(1))
